import { Router } from 'express';
import { Routes } from 'discord.js';
import { config, userManager } from '../../System';
import { UserGuild } from '../../lib/DiscordTypes';
import { DiscordConnection, writeConfig } from '../../Config';
import { getOrCreateRest } from '../../external/discord/RestManager';

const discordManagement = Router();

// manage discord data sources
discordManagement.get('/servers', (req, res) => {
    res.status(200).send(config.servers);
});

discordManagement.post('/servers', async (req, res) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    const user = userManager.getUser(req.session.user);
    if (!user.authData || !user.authData.discordToken) {
        res.sendStatus(403);
        return;
    }
    const { id, name, icon } = req.body;
    config.servers.push({
        id,
        name,
        icon,
        botConnected: false,
        enabled: true,
        adminRole: '',
    });
    await writeConfig(config);
    res.sendStatus(201);
});

discordManagement.delete('/servers', (req, res) => {
    const { id } = req.body;
    const { servers } = config;
    let found = false;
    const newServers: DiscordConnection[] = [];
    servers.forEach((server) => {
        if (server.id === id) {
            found = true;
            return;
        }
        newServers.push(server);
    });
    if (!found) {
        res.sendStatus(400);
        return;
    }
    config.servers = newServers;
    writeConfig(config);
    res.sendStatus(200);
});

// get the list servers that the user has access to add to the system
// to add a server the user must have the ability to manage the server in order
// to enable them to add the bot
discordManagement.get('/userServers', async (req, res) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    const user = userManager.getUser(req.session.user);
    if (!user.authData || !user.authData.discordToken) {
        res.sendStatus(403);
        return;
    }
    const guilds = (await getOrCreateRest(user).get(
        Routes.userGuilds(),
    )) as UserGuild[];
    res.status(200).send(
        guilds
            .filter((guild) => {
                if (config.serverIds.includes(guild.id)) return false;
                const permInt = BigInt(guild.permissions);
                const hasManageGuild =
                    // eslint-disable-next-line no-bitwise
                    (permInt & BigInt(1 << 5)) === BigInt(1 << 5);
                const hasAdminister =
                    // eslint-disable-next-line no-bitwise
                    (permInt & BigInt(1 << 3)) === BigInt(1 << 3);
                return guild.owner || hasManageGuild || hasAdminister;
            })
            .map((guild) => ({
                id: guild.id,
                name: guild.name,
                icon: guild.icon,
            })),
    );
});

export default discordManagement;
