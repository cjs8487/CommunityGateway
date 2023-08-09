import {
    ActionRowBuilder,
    ButtonBuilder,
    SlashCommandBuilder,
} from 'discord.js';
import { Command } from './Command';
import openInquiryButton from './components/OpenInquiryButton';

const inquire: Command = {
    data: new SlashCommandBuilder()
        .setName('inquire')
        .setDescription('Sets up mod mail in this channel'),
    run: async (interaction) => {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            openInquiryButton.data,
        );

        await interaction.reply({
            content: 'This is the inquiry message',
            components: [row],
        });
    },
};

export default inquire;
