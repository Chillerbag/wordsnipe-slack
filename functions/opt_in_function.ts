import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import type PlayerData from "../datastores/player_datastore.ts";
import { getWord } from "../helpers/get_word.ts";

/**
 * Functions are reusable building blocks of automation that accept
 * inputs, perform calculations, and provide outputs. Functions can
 * be used independently or as steps in workflows.
 * https://api.slack.com/automation/functions/custom
 */
export const OptIn = DefineFunction({
  callback_id: "opt_in",
  title: "Opt In to Wordsnipe",
  description: "A function called to opt a user into the game.",
  source_file: "functions/opt_in.ts",
  input_parameters: {
    properties: {
      user: {
        type: Schema.slack.types.user_id,
        description: "The user invoking the workflow",
      },
    },
    required: ["user"],
  },
  output_parameters: {
    properties: {
      updatedMsg: {
        type: Schema.types.string,
        description: "Success message to be posted",
      },
    },
    required: ["updatedMsg"],
  },
});

// if the user is already in the datastore, change their status to playing and get a word. else, create a new record and get a word.
export default SlackFunction(
  OptIn,
  async ({ inputs, client }) => {
    const userWord = getWord();
    const msg =
      `You have been opted in to the game! Your new word is: ${userWord}`;
    const getRecord = await client.apps.datastore.get<
      typeof PlayerData.definition
    >({ datastore: "WordsnipePlayerData", id: inputs.user });

    if (getRecord.ok) {
      if (Object.keys(getRecord.item).length == 0) {
        const playerRecord = {
          user_id: inputs.user,
          current_word: userWord,
          score: 0,
          status: "playing",
        };

        const putResponse = await client.apps.datastore.put<
          typeof PlayerData.definition
        >({
          datastore: "WordsnipePlayerData",
          item: playerRecord,
        });

        if (!putResponse.ok) {
          return {
            error:
              `Failed to put item into the datastore: ${putResponse.error}`,
          };
        }
      } else {
        const playerRecord = getRecord.item;
        playerRecord.status = "playing";
        playerRecord.current_word = userWord; // TODO - could be abused to get a new word from opting in and out repeatedly. Need to fix with a timestamp in the datastore.

        const putResponse = await client.apps.datastore.put<
          typeof PlayerData.definition
        >({
          datastore: "WordsnipePlayerData",
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
    // dm to be sent to user.
    return { outputs: { msg } };
  },
);
