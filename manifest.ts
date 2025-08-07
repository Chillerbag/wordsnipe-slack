import { Manifest } from "deno-slack-sdk/mod.ts";
import SampleWorkflow from "./workflows/opt_in_workflow.ts";
import PlayerData from "./datastores/player_datastore.ts";

export default Manifest({
  name: "wordsnipe-slack",
  description:
    `A game in slack, in which each player in a server has a word assigned to them, the goal is to use the word as much as possible without being sniped. 
    Each usage gets 1 point (can only get one point per message) and players can snipe each other by running a command with the word of another player.
    A miss results in 5 points lost, but a snipe results in 10 gained points, and eliminates the sniped player.
    The scores never reset.`,
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
