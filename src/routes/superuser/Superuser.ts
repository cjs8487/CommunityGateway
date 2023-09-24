import { Router } from 'express';
import { isAdmin, isAuthenticated } from '../../core/auth/AuthCore';
import discordManagement from './DiscordManagement';
import adminManagement from './AdminManagement';
import { sessionStore } from '../../System';

const superuser = Router();

superuser.use(isAuthenticated, isAdmin);

superuser.use('/discord', discordManagement);
superuser.use('/admins', adminManagement);

superuser.post('/clearSessions', (req, res) => {
    sessionStore.clear(() => {
        res.sendStatus(200);
    });
});

export default superuser;
