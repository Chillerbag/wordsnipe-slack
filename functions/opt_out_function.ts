import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import PlayerData from "../datastores/player_datastore.ts";

/**
 * Triggered by: opt_out_trigger - which is invoked with app_mentions !optOut
 */
export const OptOut = DefineFunction({
  callback_id: "opt_out",
  title: "Opt out of Wordsnipe",
  description: "A function called to opt a user out of the game.",
  source_file: "functions/opt_out_function.ts",
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
  OptOut,
  async ({ inputs, client }) => {
    const updatedMsg =
      `You have been opted out. Opt back in anytime by @ing Wordsnipe with the command: !optIn`;
    const getRecord = await client.apps.datastore.get<
      typeof PlayerData.definition
    >({ datastore: PlayerData.name, id: inputs.user });

    if (getRecord.ok) {
      // if we dont have a a record for this user, say they are not opted in.
      if (Object.keys(getRecord.item).length == 0) {
        return {
          outputs: {
            updatedMsg: `You are not currently opted in to Wordsnipe.`,
          },
        };
      } else {
        const playerRecord = getRecord.item;
        playerRecord.status = "not_playing";
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
    return { outputs: { updatedMsg } };
  },
);
