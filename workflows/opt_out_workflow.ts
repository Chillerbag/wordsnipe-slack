import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts";
import { OptOut } from "../functions/opt_out_function.ts";

const OptOutWorkflow = DefineWorkflow({
  callback_id: "opt_out_workflow",
  title: "Opt Out Workflow",
  description: "Calls the opt-out function to remove a user from the game.",
  input_parameters: {
    properties: {
      channel: {
        type: Schema.slack.types.channel_id,
        description: "The channel to post the success message in.",
      },
      user: {
        type: Schema.slack.types.user_id,
        description: "The user invoking the workflow",
      },
    },
    required: ["user", "channel"],
  },
});

const optOutFunctionStep = OptOutWorkflow.addStep(OptOut, {
  user: OptOutWorkflow.inputs.user,
});

// TODO - if object returns error instead of updatedMsg, handle it.
// TODO - dm user their word instead of posting in channel: https://api.slack.com/reference/functions/send_dm
OptOutWorkflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: OptOutWorkflow.inputs.channel,
  message: optOutFunctionStep.outputs.updatedMsg,
});

export default OptOutWorkflow;
