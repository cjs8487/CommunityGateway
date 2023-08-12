import { ChatInputCommandInteraction } from 'discord.js';
import { discordDataManager, dynamicDataManager } from '../../../System';
import { editMessage } from '../util/MessageUtils';
import { DynamicData } from '../../../database/DynamicDataManager';
import { DataSyncKeys } from '../../../database/DiscordDataManager';

export const formatDataToList = (data: DynamicData[], key: string): string => {
    const values: string[] = [];
    data.forEach((item) => {
        values.push(JSON.parse(item.data)[key]);
    });
    return `- ${values.join('\n- ')}`;
};

export const formatForType = (
    type: string,
    data: DynamicData[],
    key: string,
) => {
    switch (type) {
        case 'list':
            return formatDataToList(data, key);
        default:
            return 'Invalid data sync packet received. Unable to format data';
    }
};

export const registerNewSync = (
    interaction: ChatInputCommandInteraction,
    type: string,
    format: string,
    keys: DataSyncKeys,
    ...messages: string[]
) => {
    discordDataManager.saveDataSyncInfo(
        type,
        interaction.guildId ?? '',
        interaction.channelId,
        format,
        keys,
        ...messages,
    );
};

export const syncDataToMessages = (type: string) => {
    const targets = discordDataManager.getDataSyncInfo(type);
    targets.forEach((target) => {
        target.messages.forEach((message) => {
            // generate new message contents
            const contents = formatForType(
                target.format,
                dynamicDataManager.getAllData(target.type),
                target.key,
            );
            editMessage(target.guild, target.channel, message, contents);
        });
    });
};

export default {};
