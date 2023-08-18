import {
    MessageCreateOptions,
    MessageEditOptions,
    MessagePayload,
} from 'discord.js';
import { client } from '../DiscordBot';

export const editMessage = async (
    guildId: string,
    channelId: string,
    messageId: string,
    newContent: string | MessagePayload | MessageEditOptions,
) => {
    const guild = await client.guilds.fetch(guildId);
    const channel = await guild.channels.fetch(channelId);
    if (channel?.isTextBased()) {
        const message = await channel.messages.fetch(messageId);
        if (message.editable) {
            message.edit(newContent);
        }
    }
};

export const deleteMessage = async (
    guildId: string,
    channelId: string,
    messageId: string,
) => {
    const guild = await client.guilds.fetch(guildId);
    const channel = await guild.channels.fetch(channelId);
    if (channel?.isTextBased()) {
        const message = await channel.messages.fetch(messageId);
        if (message.deletable) {
            message.delete();
        }
    }
};

export const sendMessage = async (
    guildId: string,
    channelId: string,
    message: string | MessagePayload | MessageCreateOptions,
) => {
    const guild = await client.guilds.fetch(guildId);
    const channel = await guild.channels.fetch(channelId);
    if (channel?.isTextBased()) {
        return channel.send(message);
    }
    return undefined;
};

const MAX_CHAR = 2000;
const REASONABLE_DISTANCE = 100;
/**
 * Splits a message string into one or more smaller strings, trying to split
 * in smart locations within the message. Smart locations are line breaks and
 * punction, but greatest preference is given to line breaks.
 *
 * Splits occur at the smartest place within a reasonable distance of the
 * character that caused the message to go over the length limit. By default
 * this distance is 100 characters. If there is no split location recorded
 * within the entire string, the string will be broken at exactly the
 * character limit.
 * @param message
 * @returns
 */
export const smartSplit = (message: string): string[] => {
    const chars = [...message];
    const messages: string[] = [];

    let curr = '';
    let currCount = 0;
    let lastSplitPos = 0;
    let lastPunctuation = 0;
    chars.forEach((char) => {
        curr += char;
        currCount += 1;

        if (char === '\n') {
            lastSplitPos = currCount;
            lastPunctuation = currCount;
        }
        if (char === '.' || char === '!' || char === '?') {
            lastPunctuation = currCount;
        }

        if (currCount === MAX_CHAR) {
            let splitPos;
            if (lastSplitPos === 0 && lastPunctuation === 0) {
                splitPos = MAX_CHAR;
            } else if (currCount - lastSplitPos > REASONABLE_DISTANCE) {
                splitPos = lastPunctuation;
            } else {
                splitPos = lastSplitPos;
            }

            messages.push(curr.substring(0, splitPos).trim());
            curr = curr.substring(splitPos);
            currCount = [...curr].length;
            lastSplitPos = 0;
            lastPunctuation = 0;
        }
    });
    messages.push(curr); // push the last remaining message onto the array
    return messages;
};
