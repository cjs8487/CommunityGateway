import axios from 'axios';
import bodyParser from 'body-parser';
import { Router } from 'express';
import { isAuthenticated } from '../core/auth/AuthCore';
import discordAuth from './auth/DiscordAuth';
import dynamicData from './dynamicdata/DynamicData';

const api = Router();

api.use(bodyParser.json());

api.get('/ping', (req, res) => {
    res.send('pong').status(200);
});

api.get('/version', (req, res) => {
    res.send(process.env.npm_package_version).status(200);
});

api.get('/me', isAuthenticated, async (req, res) => {
    const { data } = await axios.get('https://discord.com/api/v10/users/@me', {
        headers: {
            Authorization: `Bearer ${req.session.token}`,
        },
    });
    res.status(200).send(data);
});

api.use('/dynamicdata', dynamicData);
api.use('/auth/discord', discordAuth);

export default api;
