import axios, { isAxiosError } from 'axios';
import { NextFunction, Router } from 'express';
import { logError } from '../../Logger';
import { exchangeCode } from '../../core/auth/DiscordTokens';
import { userManager } from '../../System';

type DiscordUser = {
    id: string;
    username: string;
}

const discordAuth = Router();

discordAuth.post('/authorized', async (req, res, next: NextFunction) => {
    const { code } = req.body;
    try {
        const token = await exchangeCode(code);

        // fetch data from discord api for db cache
        const { data }: { data: DiscordUser } = await axios.get('https://discord.com/api/v10/users/@me', {
            headers: {
                Authorization: `Bearer ${token.accessToken}`,
            },
        });

        // get user if it exists, otherwise register them internally
        const userExists = userManager.userExists(data.id);
        const user = userExists
            ? userManager.getUser(data.id)
            : userManager.registerUser(data.id, true, false, { discordToken: token });
        // check the refresh flag - this should never be set on newly created users, so this check, while wasting a few
        // cycles if the user is newly created, is completely safe regardless of which code path obtained the user
        // if the flag is set, update the stored oauth data and clear the flag
        if (!user) {
            logError('find or create user resulted in an undefined user');
            res.status(500).send('An unknown error ocurred during authorization');
            return;
        }
        if (userExists) {
            userManager.updateDiscordAuth(user.id, token);
            userManager.clearRefresh(user.id);
        }

        // load data into session and send
        req.session.regenerate((err) => {
            if (err) next(err);

            req.session.loggedIn = true;
            req.session.user = user;

            req.session.save((saveErr) => {
                if (saveErr) next(saveErr);
                res.status(200).send(user);
            });
        });
    } catch (e) {
        if (isAxiosError(e)) {
            logError(`${e.message}: ${e.response?.status} - ${JSON.stringify(e.response?.data)}`);
        } else {
            logError(`An unknown error ocurred while handling a request - ${e}`);
        }
        res.status(500).send();
    }
});

export default discordAuth;
