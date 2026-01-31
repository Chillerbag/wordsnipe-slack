import { Trigger } from "deno-slack-api/types.ts";
import { TriggerEventTypes, TriggerTypes } from "deno-slack-api/mod.ts";
import OptInWorkflow from "../workflows/opt_in_workflow.ts";

const OptInTrigger: Trigger<typeof OptInWorkflow.definition> = {
  type: TriggerTypes.Event,
  name: "Opt in Trigger",
  description: "responds to a command and @ of the bot to opt in a user",
  workflow: `#/workflows/opt_in_workflow`,
  event: {
    event_type: TriggerEventTypes.AppMentioned,
    all_resources: true,
    filter: {
      version: 1,
      root: {
        statement: "{{data.text}} CONTAINS '!optIn'",
      },
    },
  },
  inputs: {
    user_id: {
      value: "{{data.user_id}}",
    },
    user_name: {
      value: "{{data.user_name}}",
    },
    channel: {
      value: "{{data.channel_id}}",
    },
  },
};

export default OptInTrigger;
