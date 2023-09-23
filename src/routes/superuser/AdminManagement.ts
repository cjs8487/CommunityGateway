import { Router } from 'express';
import { userManager } from '../../System';

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
adminManagement.get('/roles', (req, res) => {
    res.sendStatus(200);
});

adminManagement.post('roles', (req, res) => {
    res.sendStatus(200);
});

adminManagement.delete('roles', (req, res) => {
    res.sendStatus(200);
});

export default adminManagement;
