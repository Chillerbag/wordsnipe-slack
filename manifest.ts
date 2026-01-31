import { Manifest } from "deno-slack-sdk/mod.ts";
import SampleWorkflow from "./workflows/opt_in_workflow.ts";
import PlayerData from "./datastores/player_datastore.ts";

export default Manifest({
  name: "wordsnipe-slack",
  description: `A deduction game of sniping words`,
  icon: "assets/word_snipe_icon.png",
  workflows: [SampleWorkflow],
  datastores: [PlayerData],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "datastore:read",
    "datastore:write",
    "app_mentions:read",
  ],
});
