import { NextFunction, Request, Response } from 'express';
import { DiscordToken } from './DiscordTokens';

export type AuthData = {
    discordToken?: DiscordToken;
}

// basic authentication check - first level of security for secured resources
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.session.loggedIn) next();
    else res.sendStatus(401);
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
    req.session.loggedIn = false;
    req.session.user = undefined;
    req.session.save((err) => {
        if (err) next(err);

        req.session.regenerate((genErr) => {
            if (genErr) next(genErr);

            res.sendStatus(200);
        });
    });
};