import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import PlayerData from "../datastores/player_datastore.ts";
import Constants from "../helpers/constants.ts";

/**
 * function to check a message to see if it contains a user's word, and update their score if so.
 * Triggered by: word_used_trigger, which is invoked with any message sent event.
 */
export const CheckScore = DefineFunction({
  callback_id: "word_used",
  title: "Word Used",
  description:
    "A function called to update a users score if they used their word.",
  source_file: "functions/word_used_function.ts",
  input_parameters: {
    properties: {
      user: {
        type: Schema.slack.types.user_id,
        description: "The user invoking the workflow",
      },
      messageText: {
        type: Schema.types.string,
        description: "The text of the message to check",
      },
    },
    required: ["user", "messageText"],
  },
});

export default SlackFunction(
  CheckScore,
  async ({ inputs, client }) => {
    const getRecord = await client.apps.datastore.get<
      typeof PlayerData.definition
    >({ datastore: PlayerData.name, id: inputs.user });

    if (getRecord.ok) {
      // if we dont have a a record for this user.
      if (Object.keys(getRecord.item).length == 0) {
        return { outputs: {} };
      } else {
        const playerRecord = getRecord.item;

        // check if message contains the user's word, if it does, update score.
        if (
          inputs.messageText.toLowerCase().includes(
            playerRecord.current_word.toLowerCase(),
          )
        ) {
          playerRecord.score += Constants.WORD_SENT_SCORE;
        }

        const putResponse = await client.apps.datastore.put<
          typeof PlayerData.definition
        >({
          datastore: PlayerData.name,
          item: playerRecord,
        });

        if (!putResponse.ok) {
          return {
            error:
              `Failed to update item in the datastore: ${putResponse.error}`,
          };
        }
      }
    } else {
      return {
        error: `Failed to get item from the datastore: ${getRecord.error}`,
      };
    }
    return { outputs: {} };
  },
);
