import axios from 'axios';
import {
    discordAdminRole,
    discordApiRoot,
    discordServer,
} from '../Environment';
import { DiscordToken } from '../core/auth/DiscordTokens';
import { DiscordUser, GuildMember } from './DiscordTypes';
import { securityManager, userManager } from '../System';
import { User } from '../database/UserManager';

export const hasAdminRoles = async (token: DiscordToken): Promise<boolean> => {
    const { data } = await axios.get<GuildMember>(
        `${discordApiRoot}/users/@me/guilds/${discordServer}/member`,
        {
            headers: {
                Authorization: `Bearer ${token.accessToken}`,
            },
        },
    );
    return data.roles.includes(discordAdminRole);
};

export const getOrCreateUser = async (
    data: DiscordUser,
    discordAuth: boolean,
    discordToken: DiscordToken,
) => {
    const admin = await hasAdminRoles(discordToken);
    if (userManager.userExists(data.id)) {
        const user = userManager.getUser(data.id);
        userManager.updateDiscordAuth(user.id, discordToken);
        userManager.clearRefresh(user.id);
        userManager.setAdmin(user.id, admin);
        securityManager.setGrantsForUser(user);
        return user;
    }
    return userManager.registerUser(
        data.id,
        data.username,
        data.avatar,
        discordAuth,
        admin,
        { discordToken },
    );
};

export const userHasGrant = (user: User, grant: string) => {
    if (user.isAdmin) return true;
    const grants = securityManager.securityCache.get(user.id);
    if (!grants) {
        return false;
    }
    return grants.includes(grant);
};

export default {};
