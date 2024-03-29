import { createHash } from 'crypto';
import axios, { isAxiosError } from 'axios';
import { Router } from 'express';
import { logError, logWarn } from '../../Logger';
import { exchangeCode } from '../../core/auth/DiscordTokens';
import { discordClientId, discordRedirect } from '../../Environment';
import { getOrCreateUser } from '../../lib/UserLib';
import { DiscordUser } from '../../lib/DiscordTypes';

const discordAuth = Router();

const authRoot = 'https://discord.com/api/oauth2/authorize';
const redirectUrl = encodeURIComponent(discordRedirect);
const scopeList = ['identify', 'guilds.members.read', 'guilds'];
const scopes = `scope=${encodeURIComponent(scopeList.join(' '))}`;
const authUrl = `${authRoot}?client_id=${discordClientId}&redirect_uri=${redirectUrl}&response_type=code&${scopes}`;

discordAuth.get('/doauth', (req, res) => {
    const sessionHash = createHash('sha256');
    sessionHash.update(req.session.id);
    const state = sessionHash.digest('base64url');
    const { target } = req.query;
    req.session.state = state;
    req.session.target = target?.toString();
    res.redirect(`${authUrl}&state=${state}`);
});

discordAuth.get('/redirect', async (req, res, next) => {
    const code = req.query.code as string;
    const state = req.query.state as string;
    if (state !== req.session.state) {
        // deny the auth request, this is a possible instance of CSRF, replay attack, or other malicious request
        logWarn(
            `A potentially malicious Discord authorization request has been denied. Session id: ${req.session.id}`,
        );
        // destroy this session immediately - if this is a malicious request this will prevent any further requests
        // from attempting to hijack this session
        req.session.destroy((err) => {
            if (err) next();
            // ultimately we need to redirect out of the backend flow even if though it failed
            res.redirect('/');
        });
        return;
    }
    try {
        const token = await exchangeCode(code);

        // fetch data from discord api for db cache
        const { data }: { data: DiscordUser } = await axios.get(
            'https://discord.com/api/v10/users/@me',
            {
                headers: {
                    Authorization: `Bearer ${token.accessToken}`,
                },
            },
        );

        // get user if it exists, otherwise register them internally

        const user = await getOrCreateUser(data, true, token);
        // check the refresh flag - this should never be set on newly created users, so this check, while wasting a few
        // cycles if the user is newly created, is completely safe regardless of which code path obtained the user
        // if the flag is set, update the stored oauth data and clear the flag
        if (!user) {
            logError(
                `Find or create user resulted in an undefined user. Search for id ${
                    data.id
                }} failed while using the ${typeof data.id} overload`,
            );
            res.status(500).send(
                'An unknown error ocurred during authorization',
            );
            return;
        }

        // load data into session and send
        const { target } = req.session;
        req.session.regenerate((err) => {
            if (err) next(err);

            req.session.loggedIn = true;
            req.session.user = user.id;

            req.session.save((saveErr) => {
                if (saveErr) next(saveErr);
                if (target) {
                    res.redirect(target);
                } else {
                    res.redirect('/');
                }
            });
        });
    } catch (e) {
        if (isAxiosError(e)) {
            logError(
                `${e.message}: ${e.response?.status} - ${JSON.stringify(
                    e.response?.data,
                )}`,
            );
        } else {
            logError(
                `An unknown error ocurred while handling a request - ${e}`,
            );
        }
        res.status(500).send();
    }
});

export default discordAuth;
