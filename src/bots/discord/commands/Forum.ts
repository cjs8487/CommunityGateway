import { ChannelType, SlashCommandBuilder, channelMention } from 'discord.js';
import { Command } from './Command';
import { discordDataManager } from '../../../System';

const forum: Command = {
    data: new SlashCommandBuilder()
        .setName('forum')
        .setDescription('Control automated forum actions')
        .addSubcommandGroup((group) =>
            group
                .setName('autoadd')
                .setDescription('Manage automated forum subscriptions')
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('add')
                        .setDescription(
                            'Add a new automated forum subscription, which will add you to all new posts in the forum',
                        )
                        .addChannelOption((option) =>
                            option
                                .setName('channel')
                                .setDescription('The channel to subscribe to')
                                .addChannelTypes(ChannelType.GuildForum)
                                .setRequired(true),
                        ),
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('delete')
                        .setDescription('Delete a forum subscription')
                        .addChannelOption((channel) =>
                            channel
                                .setName('channel')
                                .setDescription(
                                    'The channel to delete your subscription to',
                                )
                                .addChannelTypes(ChannelType.GuildForum)
                                .setRequired(true),
                        ),
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('clear')
                        .setDescription(
                            'Deletes all your subscriptions in this server',
                        ),
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('list')
                        .setDescription('List all your current subscriptions'),
                ),
        ),
    run: async (interaction) => {
        await interaction.deferReply({ ephemeral: true });
        const group = interaction.options.getSubcommandGroup();
        if (group === 'autoadd') {
            const subcommand = interaction.options.getSubcommand();
            if (subcommand === 'add') {
                const channel = interaction.options.getChannel('channel', true);
                discordDataManager.addUserToAutoAdd(
                    channel.id,
                    interaction.user.id,
                );
                await interaction.editReply(
                    'Successfully subscribed to the channel',
                );
            } else if (subcommand === 'delete') {
                const channel = interaction.options.getChannel('channel', true);
                discordDataManager.deleteUserAutoAdd(
                    channel.id,
                    interaction.user.id,
                );
                await interaction.editReply('Successfully delete subscription');
            } else if (subcommand === 'clear') {
                const deleted = discordDataManager.clearUserAutoAdd(
                    interaction.user.id,
                );
                await interaction.editReply(
                    `Successfully deleted ${deleted} subscription`,
                );
            } else if (subcommand === 'list') {
                const channels = discordDataManager.channelsUserAutoAddedTo(
                    interaction.user.id,
                );
                let reply = `You are subscribed to ${channels.length} channels in this server.`;
                channels.forEach((channelId) => {
                    reply += `\n- ${channelMention(channelId)}`;
                });
                interaction.editReply(reply);
            }
        }
    },
};

export default forum;
