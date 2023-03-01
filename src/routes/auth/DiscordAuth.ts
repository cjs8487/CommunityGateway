import { isAxiosError } from 'axios';
import { NextFunction, Router } from 'express';
import { logError } from '../../Logger';
import { exchangeCode } from '../../core/auth/DiscordTokens';

const discordAuth = Router();

discordAuth.post('/authorized', async (req, res, next: NextFunction) => {
    const { code } = req.body;
    try {
        const token = await exchangeCode(code);
        req.session.regenerate((err) => {
            if (err) next(err);

            req.session.loggedIn = true;
            req.session.token = token.accessToken;
            req.session.refresh = token.refreshToken;

            req.session.save((saveErr) => {
                if (saveErr) next(saveErr);
                res.status(200).send();
            });
        });
    } catch (e) {
        if (isAxiosError(e)) {
            logError(e.message);
        } else {
            logError(`An unknown error ocurred while handling a request - ${e}`);
        }
        res.status(500).send();
    }
});

export default discordAuth;
