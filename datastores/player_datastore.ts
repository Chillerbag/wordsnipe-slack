import { DefineDatastore, Schema } from "deno-slack-sdk/mod.ts";

const PlayerData = DefineDatastore({
  name: "WordsnipePlayerData",
  primary_key: "user_id",
  attributes: {
    user_id: {
      type: Schema.slack.types.user_id,
      description: "The ID of the user associated with this record.",
    },
    current_word: {
      type: Schema.types.string,
      description: "The current word belonging to a player",
    },
    score: {
      type: Schema.types.integer,
      description: "The current score of a player.",
      default: 0,
    },
    status: {
      type: Schema.types.string,
      description: "The status of a player.",
      enum: ["playing", "not_playing", "eliminated"],
    },
  },
});

export default PlayerData;
