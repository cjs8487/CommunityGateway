import axios, { isAxiosError } from 'axios';
import bodyParser from 'body-parser';
import { Router } from 'express';
import { logError } from '../Logger';
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
    try {
        const { data } = await axios.get('https://discord.com/api/v10/users/@me', {
            headers: {
                Authorization: `Bearer ${req.session.user?.authData?.discordToken?.accessToken}`,
            },
        });
        res.status(200).send(data);
    } catch (e) {
        if (isAxiosError(e)) {
            if (e.response) {
                logError(
                    'Unable to fetch user data - one or more services returned an error. ' +
                    `Error ${e.response.status} - ${e.response.data}`,
                );
                req.session.loggedIn = false;
            } else {
                logError('An unknown error ocurred while attempting to fetch user data');
            }
        }
        res.status(500).send();
    }
});

api.get('/logout', isAuthenticated, (req, res, next) => {
    req.session.loggedIn = false;
    req.session.user = undefined;
    req.session.save((err) => {
        if (err) next(err);

        req.session.regenerate((genErr) => {
            if (genErr) next(genErr);

            res.sendStatus(200);
        });
    });
});

api.use('/dynamicdata', dynamicData);
api.use('/auth/discord', discordAuth);

export default api;
