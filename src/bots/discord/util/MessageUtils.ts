import { MessageEditOptions, MessagePayload } from 'discord.js';
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
