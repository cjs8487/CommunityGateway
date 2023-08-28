import axios, { isAxiosError } from 'axios';
import bodyParser from 'body-parser';
import { Router } from 'express';
import { userManager } from '../System';
import { logError } from '../Logger';
import { isAuthenticated, logout } from '../core/auth/AuthCore';
import discordAuth from './auth/DiscordAuth';
import dynamicData from './dynamicdata/DynamicData';
import asyncs from './asyncs/AsyncList';
import files from './files/Files';
import security from './security/Security';

const api = Router();

api.use(bodyParser.json());

api.get('/ping', (req, res) => {
    res.send('pong').status(200);
});

api.get('/version', (req, res) => {
    res.send(process.env.npm_package_version).status(200);
});

api.get(
    '/me',
    isAuthenticated,
    async (req, res, next) => {
        if (!req.session.user) {
            next('Login flag is set, but no user is attached');
            return;
        }
        try {
            const internalUser = userManager.getUser(req.session.user);
            const { data } = await axios.get(
                'https://discord.com/api/v10/users/@me',
                {
                    headers: {
                        Authorization: `Bearer ${internalUser?.authData?.discordToken?.accessToken}`,
                    },
                },
            );
            const userData = {
                ...data,
                displayName: data.global_name,
                internalId: req.session.user,
                isAdmin: internalUser?.isAdmin,
            };
            res.status(200).send(userData);
        } catch (e) {
            if (isAxiosError(e)) {
                if (e.response) {
                    logError(
                        'Unable to fetch user data - one or more services returned an error. ' +
                            `Error ${e.response.status} - ${JSON.stringify(
                                e.response.data,
                            )}`,
                    );
                    next();
                } else {
                    logError(
                        'An unknown error ocurred while attempting to fetch user data',
                    );
                }
            }
            res.status(500).send();
        }
    },
    logout,
);

api.get('/logout', isAuthenticated, logout);

api.use('/dynamicdata', dynamicData);
api.use('/asyncs', asyncs);
api.use('/auth/discord', discordAuth);
api.use('/files', files);
api.use('/security', security);

export default api;
