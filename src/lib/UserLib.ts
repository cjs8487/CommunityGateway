import axios from 'axios';
import { discordAdminRole, discordApiRoot, discordServer } from '../Environment';
import { DiscordToken } from '../core/auth/DiscordTokens';
import { GuildMember } from './DiscordTypes';

export const hasAdminRoles = async (token: DiscordToken): Promise<boolean> => {
    const { data } = await axios.get<GuildMember>(`${discordApiRoot}/users/@me/guilds/${discordServer}/member`, {
        headers: {
            Authorization: `Bearer ${token.accessToken}`,
        },
    });
    return data.roles.includes(discordAdminRole);
};

export default {};
