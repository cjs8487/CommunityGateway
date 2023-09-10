import { REST, Routes } from 'discord.js';
import { discordBotToken } from '../../Environment';
import { GuildMember } from '../../lib/DiscordTypes';

const rest = new REST({ version: '10' }).setToken(discordBotToken);

export const getGuildMember = async (
    guild: string,
    user: string,
): Promise<GuildMember> => {
    const res = await rest.get(Routes.guildMember(guild, user));
    return res as GuildMember;
};

export default {};
