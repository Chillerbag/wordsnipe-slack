import { Trigger } from "deno-slack-api/types.ts";
import { TriggerEventTypes, TriggerTypes } from "deno-slack-api/mod.ts";
import OptOutWorkflow from "../workflows/opt_out_workflow.ts";

const OptOutTrigger: Trigger<typeof OptOutWorkflow.definition> = {
  type: TriggerTypes.Event,
  name: "Opt out Trigger",
  description: "responds to a command and @ of the bot to opt out a user",
  workflow: `#/workflows/opt_out_workflow`,
  event: {
    event_type: TriggerEventTypes.AppMentioned,
    all_resources: true,
    filter: {
      version: 1,
      root: {
        statement: "{{data.text}} CONTAINS '!optOut'",
      },
    },
  },
  inputs: {
    user: {
      value: "{{data.user_id}}",
    },
    channel: {
      value: "{{data.channel_id}}",
    },
  },
};

export default OptOutTrigger;
