import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import PlayerData from "../datastores/player_datastore.ts";
import Constants from "../helpers/constants.ts";

/**
 * function to check a message to see if a user got sniped.
 * Triggered by: word_sniped_trigger, which is invoked with the command @bot !snipe @username [word].
 */
export const CheckScore = DefineFunction({
  callback_id: "word_sniped",
  title: "Word Sniped",
  description:
    "A function called to update a users score if they used their word.",
  source_file: "functions/word_sniped_function.ts",
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
  output_parameters: {
    properties: {
      outputMsg: {
        type: Schema.types.string,
        description: "Message saying whether or not the snipe was successful",
      },
    },
    required: ["outputMsg"],
  },
});

export default SlackFunction(
  CheckScore,
  async ({ inputs, client }) => {
    const messageParts: string[] = inputs.messageText.split(" ");
    const snipedUserMention: string = messageParts[messageParts.length - 2];
    const snipedUserId: string = snipedUserMention.replace("<@", "").replace(
      ">",
      "",
    );

    // find the sniped word in the datastore.
    const getRecordSniped = await client.apps.datastore.get<
      typeof PlayerData.definition
    >({ datastore: PlayerData.name, id: snipedUserId });

    const getRecordSniper = await client.apps.datastore.get<
      typeof PlayerData.definition
    >({ datastore: PlayerData.name, id: inputs.user });

    if (getRecordSniped.ok && getRecordSniper.ok) {
      // if we dont have a a record for this user, then return an error.
      if (Object.keys(getRecordSniped.item).length == 0) {
        // TODO - change this msg to be an output instead of err.
        return {
          error: `Failed to find targeted user: ${getRecordSniped.error}`,
        };
      } else {
        const snipedUser = getRecordSniped.item;
        const sniperUser = getRecordSniper.item;
        if (
          inputs.messageText.toLowerCase().includes(
            snipedUser.current_word.toLowerCase(),
          )
        ) {
          // remove one player from the game and increase points of the other
          snipedUser.status = "eliminated";
          snipedUser.score += Constants.GOT_SNIPED_SCORE;
          sniperUser.score += Constants.WORD_SNIPED_SCORE;
          await client.apps.datastore.put<
            typeof PlayerData.definition
          >({
            datastore: PlayerData.name,
            item: sniperUser,
          });
          await client.apps.datastore.put<
            typeof PlayerData.definition
          >({
            datastore: PlayerData.name,
            item: snipedUser,
          });
          return {
            outputs: {
              outputMsg:
                `<@${inputs.user}> Successfully sniped: <@${snipedUser.user_id}>! their word was: ${snipedUser.current_word}`,
            },
          };
        } else {
          sniperUser.score += Constants.SNIPE_FAILURE_SCORE;
          await client.apps.datastore.put<
            typeof PlayerData.definition
          >({
            datastore: PlayerData.name,
            item: sniperUser,
          });
          return {
            outputs: {
              outputMsg:
                `<@${inputs.user}> failed to snipe: <@${snipedUser.user_id}>! they thought the target's word was: ${snipedUser.current_word}`,
            },
          };
        }
      }
    } else {
      return {
        error: `Failed to find a user!`,
      };
    }
  },
);
