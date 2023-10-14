import { Router } from 'express';
import {
    isAdmin,
    isAuthenticated,
    isSuperuser,
} from '../../core/auth/AuthCore';
import discordManagement from './DiscordManagement';
import adminManagement from './AdminManagement';
import { sessionStore } from '../../System';

const superuser = Router();

superuser.use(isAuthenticated, isAdmin, isSuperuser);

superuser.use('/discord', discordManagement);
superuser.use('/admins', adminManagement);

superuser.post('/clearSessions', (req, res) => {
    sessionStore.clear(() => {
        res.sendStatus(200);
    });
});

export default superuser;
