import axios from 'axios';
import { discordApiRoot } from '../Environment';
import { DiscordToken } from '../core/auth/DiscordTokens';
import { DiscordUser, GuildMember } from './DiscordTypes';
import { config, securityManager, userManager } from '../System';
import { User } from '../database/UserManager';

export const hasAdminRoles = async (token: DiscordToken): Promise<boolean> => {
    let hasPerms = false;
    const { data: me } = await axios.get<DiscordUser>(
        `${discordApiRoot}/users/@me`,
        {
            headers: {
                Authorization: `Bearer ${token.accessToken}`,
            },
        },
    );
    if (config.superusers.includes(me.id)) return true;
    await Promise.all(
        config.servers.map(async (server) => {
            if (hasPerms || !server.adminRole || !server.enabled) return;
            const { data } = await axios.get<GuildMember>(
                `${discordApiRoot}/users/@me/guilds/${server.id}/member`,
                {
                    headers: {
                        Authorization: `Bearer ${token.accessToken}`,
                    },
                },
            );
            if (data.roles.includes(server.adminRole)) {
                hasPerms = true;
            }
        }),
    );
    return hasPerms;
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
    const hasGrant = grants.includes(grant);
    if (!hasGrant) {
        securityManager.setGrantsForUser(user);
        return securityManager.securityCache.get(user.id)?.includes(grant);
    }
    return true;
};

export default {};
