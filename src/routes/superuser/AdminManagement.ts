import { Router } from 'express';
import { config, userManager } from '../../System';
import { client } from '../../bots/discord/DiscordBot';
import { writeConfig } from '../../Config';

const adminManagement = Router();

// gets the list of users with admin permissions
adminManagement.get('/list', (req, res) => {
    res.status(200).send({
        admins: userManager.getAdmins().map((user) => ({
            displayName: user.discordUsername,
            avatar: user.discordAvatar,
            id: user.discordId,
            internalId: user.id,
            isAdmin: user.isAdmin,
        })),
        superusers: [],
    });
});

// manage admin roles
adminManagement.get('/roles/:server', async (req, res) => {
    if (!req.session.user) {
        res.sendStatus(401);
        return;
    }
    const user = userManager.getUser(req.session.user);
    if (!user.authData || !user.authData.discordToken || !user.hasDiscordAuth) {
        res.sendStatus(403);
        return;
    }
    const { server } = req.params;
    res.status(200).send(
        (await (await client.guilds.fetch(server)).roles.fetch()).filter(
            (role) => !role.managed,
        ),
    );
});

adminManagement.put('/roles/:server', async (req, res) => {
    const { server } = req.params;
    const { role } = req.body;
    const connection = config.servers.find((conn) => conn.id === server);
    if (!connection) {
        res.sendStatus(404);
        return;
    }
    connection.adminRole = role;
    await writeConfig(config);
    res.sendStatus(200);
});

adminManagement.delete('/roles/:server', (req, res) => {
    res.sendStatus(200);
});

export default adminManagement;
