import { ButtonBuilder, ButtonInteraction } from 'discord.js';

export type ButtonHandlerFunction = (
    interaction: ButtonInteraction,
) => Promise<void>;

interface InteractionButton {
    id: string;
    data: ButtonBuilder;
    run: ButtonHandlerFunction;
}

export default InteractionButton;
