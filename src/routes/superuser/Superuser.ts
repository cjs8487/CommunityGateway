import { Router } from 'express';
import { isAdmin, isAuthenticated } from '../../core/auth/AuthCore';
import discordManagement from './DiscordManagement';
import adminManagement from './AdminManagement';

const superuser = Router();

superuser.use(isAuthenticated, isAdmin);

superuser.use('/discord', discordManagement);
superuser.use('/', adminManagement);

export default superuser;
