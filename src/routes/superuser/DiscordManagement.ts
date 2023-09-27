import { Router } from 'express';
import { OAuth2Scopes, PermissionFlagsBits, Role, Routes } from 'discord.js';
import { config, userManager } from '../../System';
import { UserGuild } from '../../lib/DiscordTypes';
import { DiscordConnection, writeConfig } from '../../Config';
import { getOrCreateRest } from '../../external/discord/RestManager';
import { getGuilds } from '../../external/discord/DiscordApi';
import { client } from '../../bots/discord/DiscordBot';

const discordManagement = Router();

// manage discord data sources
discordManagement.get('/servers', async (req, res) => {
    const servers = await Promise.all(
        config.servers.map(async (server) => {
            const data = {
                id: server.id,
                icon: server.icon,
                name: server.name,
                botConnected: server.botConnected,
                enabled: server.enabled,
                adminRole: undefined as unknown as Role,
            };
            if (server.adminRole) {
                const role = await (
                    await client.guilds.fetch(server.id)
                ).roles.fetch(server.adminRole);
                if (role) {
                    data.adminRole = role;
                }
            }
            return data;
        }),
    );
    res.status(200).send(servers);
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
        botConnected: client.guilds.cache.has(id),
        enabled: true,
        adminRole: '',
    });
    await writeConfig(config);
    res.sendStatus(201);
});

discordManagement.delete('/servers/:serverId', async (req, res) => {
    const { serverId } = req.params;
    const { servers } = config;
    let found = false;
    const newServers: DiscordConnection[] = [];
    servers.forEach((server) => {
        if (server.id === serverId) {
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
    config.serverIds = newServers.map((server) => server.id);
    await writeConfig(config);
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
    const botServers = await getGuilds();
    const botServerIds = botServers.map((guild) => guild.id);
    const usedIds: string[] = [];
    res.status(200).send(
        guilds
            .filter((guild) => {
                if (config.serverIds.includes(guild.id)) return false;
                if (usedIds.includes(guild.id)) return false;

                usedIds.push(guild.id);

                // the bot already being in a server trumps all other conditions
                // if the bot is in the server, the server should be allowed to
                // connect, even if the user wouldn't normally be able to do the
                // connection process
                if (botServerIds.includes(guild.id)) return true;

                // check if the user has the correct permissions
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

discordManagement.get('/link', (req, res) => {
    res.status(200).send({
        link: client.generateInvite({
            permissions: [PermissionFlagsBits.Administrator],
            scopes: [OAuth2Scopes.Bot],
        }),
    });
});

export default discordManagement;
