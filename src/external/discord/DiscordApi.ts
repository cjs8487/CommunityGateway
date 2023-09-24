import { REST, Routes } from 'discord.js';
import { discordBotToken } from '../../Environment';
import { Guild, GuildMember, Role } from '../../lib/DiscordTypes';

const rest = new REST({ version: '10' }).setToken(discordBotToken);

export const getGuildMember = async (
    guild: string,
    user: string,
): Promise<GuildMember> => {
    const res = await rest.get(Routes.guildMember(guild, user));
    return res as GuildMember;
};

export const getGuild = async (guild: string): Promise<Guild> => {
    const res = await rest.get(Routes.guild(guild));
    return res as Guild;
};

export const getGuilds = async (): Promise<Guild[]> => {
    const res = await rest.get(Routes.userGuilds());
    return res as Guild[];
};

export const getRoles = async (guild: string): Promise<Role[]> => {
    const res = await rest.get(Routes.guildRoles(guild));
    return res as Role[];
};

export const getRole = async (guild: string, role: string): Promise<Role> => {
    const res = await rest.get(Routes.guildRole(guild, role));
    return res as Role;
};

export default {};
