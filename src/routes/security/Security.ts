import { Router } from 'express';
import { securityManager } from '../../System';
import { isAdmin, isAuthenticated } from '../../core/auth/AuthCore';

const security = Router();

security.get('/', (req, res) => {
    const roles = securityManager.getAllRoles().map((role) => ({
        id: role.id,
        role: securityManager.getDiscordRole(role.roleId),
        enabled: role.enabled,
        points: role.points,
    }));
    res.status(200).send(roles);
});

security.get('/roles', isAuthenticated, isAdmin, async (req, res) => {
    res.status(200).send(
        securityManager.availableRoles.map((role) => ({
            id: role.id,
            name: role.name,
            color: role.color,
            guildId: role.guild.id,
            guildIcon: role.guild.icon,
            guildName: role.guild.name,
        })),
    );
});

security.post('/', isAuthenticated, isAdmin, (req, res) => {
    const { role } = req.body;
    if (!securityManager.roleIsValid(role)) {
        res.status(400).send(
            'Security Role already exists for this Discord Role',
        );
        return;
    }
    securityManager.createRole(role);
    res.status(200).send();
});

security.post('/:role/changeEnabled', isAuthenticated, isAdmin, (req, res) => {
    const { role } = req.params;
    const { enabled } = req.body;
    const roleId = Number(role);
    if (Number.isNaN(roleId)) {
        res.status(400).send('Invalid security role id');
        return;
    }
    if (!securityManager.roleExists(roleId)) {
        res.status(404).send();
        return;
    }
    securityManager.setRoleEnabled(roleId, enabled);
    res.status(200).send();
});

security.post(
    '/:role/changeDiscordRole',
    isAuthenticated,
    isAdmin,
    (req, res) => {
        const { role } = req.params;
        const { discordRole } = req.body;
        if (!securityManager.roleIsValid(discordRole)) {
            res.status(400).send(
                'Security Role already exists for this Discord Role',
            );
            return;
        }
        const roleId = Number(role);
        if (Number.isNaN(roleId)) {
            res.status(400).send('Invalid role id');
            return;
        }
        securityManager.setDiscordRole(roleId, discordRole);
        res.status(200).send();
    },
);

security.delete('/:role', isAuthenticated, isAdmin, (req, res) => {
    const { role } = req.params;
    const roleId = Number(role);
    if (Number.isNaN(roleId)) {
        res.status(400).send('Invalid role id');
        return;
    }
    if (!securityManager.roleExists(roleId)) {
        res.status(404).send('Security role not found');
        return;
    }
    securityManager.deleteRole(roleId);
    res.status(200).send();
});

security.post(
    '/points/:point/changeEnabled',
    isAuthenticated,
    isAdmin,
    (req, res) => {
        res.status(200).send();
        const { point } = req.params;
        const { enabled } = req.body;
        const pointId = Number(point);
        if (Number.isNaN(pointId)) {
            res.status(400).send('Invalid security role id');
            return;
        }
        securityManager.setPointEnabled(pointId, enabled);
    },
);

export default security;
