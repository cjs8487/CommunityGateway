import { ChatInputCommandInteraction, bold, hideLinkEmbed } from 'discord.js';
import {
    discordDataManager,
    dispatchManager,
    dynamicDataManager,
} from '../../../System';
import {
    deleteMessage,
    editMessage,
    sendMessage,
    smartSplit,
} from '../util/MessageUtils';
import { DynamicData } from '../../../database/DynamicDataManager';
import { DataSyncKeys } from '../../../database/DiscordDataManager';

export const formatDataToList = (data: DynamicData[], key: string): string => {
    const values: string[] = [];
    data.forEach((item) => {
        values.push(JSON.parse(item.data)[key]);
    });
    return `- ${values.join('\n- ')}`;
};

export const formatDataToLabeledList = (
    data: DynamicData[],
    labelKey: string,
    textKey: string,
) => {
    const values: string[] = [];
    data.forEach((item) => {
        const parsedItem = JSON.parse(item.data);
        values.push(`${bold(parsedItem[labelKey])}\n${parsedItem[textKey]}`);
    });
    return `${values.join('\n\n')}`;
};

export const formatDataToLabelLinkList = (
    data: DynamicData[],
    labelKey: string,
    linkKey: string,
) => {
    const values: string[] = [];
    data.forEach((item) => {
        const parsedItem = JSON.parse(item.data);
        values.push(
            `${parsedItem[labelKey]}: ${hideLinkEmbed(parsedItem[linkKey])}`,
        );
    });
    return `- ${values.join('\n- ')}`;
};

export const formatDataToGroupLabelLinkList = (
    data: DynamicData[],
    labelKey: string,
    linkKey: string,
    groupKey: string,
) => {
    const values: Map<string, string[]> = new Map();
    data.forEach((item) => {
        const parsedItem = JSON.parse(item.data);
        const key = parsedItem[groupKey];
        if (!values.has(key)) {
            values.set(key, []);
        }
        values
            .get(key)
            ?.push(
                `${parsedItem[labelKey]}: ${hideLinkEmbed(
                    parsedItem[linkKey],
                )}`,
            );
    });
    const returnStrings: string[] = [];
    values.forEach((group, key) => {
        returnStrings.push(bold(key));
        group.forEach((item) => {
            returnStrings.push(` ${item}`);
        });
    });
    return returnStrings.join('\n');
};

export const formatForType = (
    type: string,
    data: DynamicData[],
    keys: DataSyncKeys,
) => {
    switch (type) {
        case 'list':
            return formatDataToList(data, keys.key);
        case 'labelList':
            return formatDataToLabeledList(
                data,
                keys.key,
                keys.secondaryKey ?? '',
            );
        case 'labelLink':
            return formatDataToLabelLinkList(
                data,
                keys.key,
                keys.secondaryKey ?? '',
            );
        case 'groupLabelLink':
            return formatDataToGroupLabelLinkList(
                data,
                keys.key,
                keys.secondaryKey ?? '',
                keys.groupKey ?? '',
            );
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

export const clearSync = (interaction: ChatInputCommandInteraction) => {
    const messages = discordDataManager.clearSyncForChannel(
        interaction.channelId,
    );
    messages.forEach((message) => {
        deleteMessage(
            interaction.guildId ?? '',
            interaction.channelId,
            message,
        );
    });
    return messages.length;
};

export const syncDataToMessages = (type: string) => {
    dispatchManager.pendRun(`syncDataToMessages${type}`, () => {
        const targets = discordDataManager.getDataSyncInfo(type);
        targets.forEach((target) => {
            const contents = formatForType(
                target.format,
                dynamicDataManager.getAllData(target.type),
                {
                    key: target.key,
                    secondaryKey: target.secondaryKey,
                    groupKey: target.groupKey,
                },
            );
            const responseList = smartSplit(contents);
            if (responseList.length >= target.messages.length) {
                responseList.forEach(async (response, index) => {
                    if (index < responseList.length) {
                        editMessage(
                            target.guild,
                            target.channel,
                            target.messages[index],
                            response,
                        );
                    } else {
                        const message = await sendMessage(
                            target.guild,
                            target.channel,
                            response,
                        );
                        if (!message) {
                            // TODO: ASYNC ERROR REPORTING?
                            return;
                        }
                        discordDataManager.addMessageToSyncGroup(
                            target.id,
                            message.id,
                        );
                    }
                });
            } else {
                target.messages.forEach(async (message, index) => {
                    if (index < responseList.length) {
                        editMessage(
                            target.guild,
                            target.channel,
                            message,
                            responseList[index],
                        );
                    } else {
                        await deleteMessage(
                            target.guild,
                            target.channel,
                            message,
                        );
                    }
                });
            }
        });
    });
};

export const syncAll = () => {
    const types = dynamicDataManager.getAllTypes();
    types.forEach((type) => {
        syncDataToMessages(type.name);
    });
};

export default {};
