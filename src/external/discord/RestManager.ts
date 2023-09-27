import { REST } from 'discord.js';
import { User } from '../../database/UserManager';

const clients = new Map<number, REST>();

export const getOrCreateRest = (user: User): REST => {
    if (clients.has(user.id)) {
        return clients.get(user.id)!;
    }
    if (!user.hasDiscordAuth || !user.authData || !user.authData.discordToken) {
        throw new Error(
            'Cannot create a Discord REST client for a user not authorized with Disocrd',
        );
    }
    const rest = new REST({ version: '10', authPrefix: 'Bearer' }).setToken(
        user.authData?.discordToken?.accessToken,
    );

    clients.set(user.id, rest);
    return rest;
};

export default {};
