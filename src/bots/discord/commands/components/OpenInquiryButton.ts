import { ButtonBuilder, ButtonStyle } from 'discord.js';
import InteractionButton from './InteractionButton';

const id = 'open-inquiry';

const openInquiryButton: InteractionButton = {
    id,
    data: new ButtonBuilder()
        .setCustomId(id)
        .setLabel('Open Ticket')
        .setStyle(ButtonStyle.Primary),
    run: async (interaction) => {
        await interaction.reply('You clicked the inquire button');
    },
};

export default openInquiryButton;
