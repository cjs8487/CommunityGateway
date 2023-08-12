import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

export interface Command {
    data:
        | Omit<SlashCommandBuilder, 'addSubcommandGroup' | 'addSubcommand'>
        | SlashCommandSubcommandsOnlyBuilder;
    run: (interaction: ChatInputCommandInteraction) => Promise<void>;
}
