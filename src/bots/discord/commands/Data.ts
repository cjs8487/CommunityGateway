import { SlashCommandBuilder, SlashCommandStringOption } from 'discord.js';
import { Command } from './Command';
import { discordDataManager, dynamicDataManager } from '../../../System';
import {
    clearSync,
    formatDataToGroupLabelLinkList,
    formatDataToLabelLinkList,
    formatDataToList,
} from '../modules/DataSync';
import { smartSplit } from '../util/MessageUtils';

const typeOption = new SlashCommandStringOption()
    .setName('type')
    .setDescription('The name of the data type')
    .setRequired(true);

const data: Command = {
    data: new SlashCommandBuilder()
        .setName('data')
        .setDescription(
            "Interfaces with Community Gateway's Dyanamic Data system ",
        )
        .addSubcommandGroup((group) =>
            group
                .setName('sync')
                .setDescription(
                    'Automatically syncs data changes between the server and this channel',
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('list')
                        .setDescription(
                            'Lists a basic data piece with a specified key',
                        )
                        .addStringOption(typeOption)
                        .addStringOption((option) =>
                            option
                                .setName('key')
                                .setDescription(
                                    'The name of the field in the data to display',
                                )
                                .setRequired(true),
                        ),
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('label-and-link')
                        .setDescription(
                            'Lists data items with a label and link from the supplied keys',
                        )
                        .addStringOption(typeOption)
                        .addStringOption((option) =>
                            option
                                .setName('label-key')
                                .setDescription(
                                    'The name of the field in the data to display as the label',
                                )
                                .setRequired(true),
                        )
                        .addStringOption((option) =>
                            option
                                .setName('link-key')
                                .setDescription(
                                    'The name of the field in the data to display as the link',
                                )
                                .setRequired(true),
                        ),
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('group-label-and-link')
                        .setDescription(
                            'Lists data items with a label and link from the supplied keys, grouped by a specied key',
                        )
                        .addStringOption(typeOption)
                        .addStringOption((option) =>
                            option
                                .setName('label-key')
                                .setDescription(
                                    'The name of the field in the data to display as the label',
                                )
                                .setRequired(true),
                        )
                        .addStringOption((option) =>
                            option
                                .setName('link-key')
                                .setDescription(
                                    'The name of the field in the data to display as the link',
                                )
                                .setRequired(true),
                        )
                        .addStringOption((option) =>
                            option
                                .setName('group-key')
                                .setDescription(
                                    'The name of the field in the data to group by',
                                )
                                .setRequired(true),
                        ),
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('clear')
                        .setDescription(
                            'Clears the sync properties of this channel',
                        ),
                ),
        ),
    run: async (interaction) => {
        // const ephemeral = interaction.options.getSubcommand() === 'clear';
        await interaction.deferReply({ ephemeral: true });
        const type = interaction.options.getString('type') ?? '';
        if (interaction.options.getSubcommandGroup() === 'sync') {
            const subcommand = interaction.options.getSubcommand();
            if (subcommand === 'list') {
                const key = interaction.options.getString('key', true);
                const requestedData = dynamicDataManager.getAllData(type);
                if (requestedData.length === 0) {
                    await interaction.editReply('No data found.');
                    return;
                }
                const response = formatDataToList(requestedData, key);
                const responseList = smartSplit(response);
                responseList.forEach(async (content) => {
                    const message = await interaction.channel?.send({
                        content,
                    });
                    discordDataManager.saveDataSyncInfo(
                        type,
                        interaction.guildId ?? '',
                        interaction.channelId,
                        'list',
                        {
                            key,
                        },
                        message?.id ?? '',
                    );
                });
                await interaction.editReply(
                    `Success. Created ${responseList.length} messages.`,
                );
            } else if (subcommand === 'label-and-link') {
                const labelKey = interaction.options.getString(
                    'label-key',
                    true,
                );
                const linkKey = interaction.options.getString('link-key', true);
                const requestedData = dynamicDataManager.getAllData(type);
                if (requestedData.length === 0) {
                    await interaction.editReply('No data found.');
                    return;
                }
                const response = formatDataToLabelLinkList(
                    requestedData,
                    labelKey,
                    linkKey,
                );
                const responseList = smartSplit(response);
                responseList.forEach(async (content) => {
                    const message = await interaction.channel?.send({
                        content,
                    });
                    discordDataManager.saveDataSyncInfo(
                        type,
                        interaction.guildId ?? '',
                        interaction.channelId,
                        'list',
                        {
                            key: labelKey,
                            secondaryKey: linkKey,
                        },
                        message?.id ?? '',
                    );
                });
                await interaction.editReply(
                    `Success. Created ${responseList.length} messages.`,
                );
            } else if (subcommand === 'group-label-and-link') {
                const labelKey = interaction.options.getString(
                    'label-key',
                    true,
                );
                const linkKey = interaction.options.getString('link-key', true);
                const groupKey = interaction.options.getString(
                    'group-key',
                    true,
                );
                const requestedData = dynamicDataManager.getAllData(type);
                if (requestedData.length === 0) {
                    await interaction.editReply('No data found.');
                    return;
                }
                const response = formatDataToGroupLabelLinkList(
                    requestedData,
                    labelKey,
                    linkKey,
                    groupKey,
                );
                const responseList = smartSplit(response);
                responseList.forEach(async (content) => {
                    const message = await interaction.channel?.send({
                        content,
                    });
                    discordDataManager.saveDataSyncInfo(
                        type,
                        interaction.guildId ?? '',
                        interaction.channelId,
                        'list',
                        {
                            key: labelKey,
                            secondaryKey: linkKey,
                            groupKey,
                        },
                        message?.id ?? '',
                    );
                });
                await interaction.editReply(
                    `Success. Created ${responseList.length} messages.`,
                );
            } else if (subcommand === 'clear') {
                const count = clearSync(interaction);
                interaction.editReply(
                    `Sync data for channel cleared. Deleted ${count} messages`,
                );
            }
        }
    },
};

export default data;
