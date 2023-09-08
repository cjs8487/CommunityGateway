import { NextFunction, Request, Response } from 'express';
import { userManager } from '../../System';

// small implementation note about sessions - we unset session data, and then
// destroy the session after forcing a save back to the database. This ensures
// that session data is updated as soon as possible, and then takes the steps to
// prevent attacks and further use of the session. If we just destroyed the
// session without unsetting the values, it's possible that a parallel request
// could use stale data while asynchronous operations are being executed.

// basic authentication check - first level of security for secured resources
export const isAuthenticated = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    if (req.session.loggedIn) {
        // seeing the login flag in the session isn't sufficient to prove that a
        // user hasa valid logged in session. The most realistic case for this
        // is a stale session persisting past a server restart and allowing the
        // logged in user to temporarily override any restrictions that may have
        // been linked to the user account during startup sequences. This can
        // also happen in periodic refreshes, or anytime a user update is
        // triggered from a source other than the user being modified (such as a
        // Discord gateway event). Since these processes are effectively
        // completely separate, it's difficult and unsafe for them to attempt to
        // modify session data, so we rely on the underlying data system to
        // validate things at the request level. This should also prevent race
        // conditions with triggered events and api requests

        // catch session desync, this should be exceedingly rare
        if (!req.session.user) {
            req.session.loggedIn = false;
            req.session.user = undefined;
            req.session.save((err) => {
                if (err) next(err);

                req.session.destroy((genErr) => {
                    if (genErr) next(genErr);

                    res.sendStatus(401);
                });
            });
            return;
        }

        // catch user status situations - caught cases
        // 1. User is deleted from working memory or otherwise missing
        // 2. User needs to be refreshed (which may mean they have revoked their
        //    Discord token, which effectively invalidates their account)
        const user = userManager.getUser(req.session.user);
        if (!user || user.needsRefresh) {
            req.session.loggedIn = false;
            req.session.user = undefined;
            req.session.save((err) => {
                if (err) next(err);

                req.session.destroy((genErr) => {
                    if (genErr) next(genErr);

                    res.sendStatus(401);
                });
            });
            return;
        }
        next();
    } else {
        res.sendStatus(401);
    }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    // since this condition checks data living in the active program memory,
    // there is no risk for compromises via stale session like there is for a
    // base login check. On its own, this check is vulnerable to the identical
    // risks as the base authentication check (since a stale/expired/revoked
    // account could still retain access via a preexisting session), but anytime
    // this function is reached in a middleware stack, the base authentication
    // check should have already been checked and passed, and doing the checks
    // again here would risk masking bugs in middleware stacks.
    if (req.session.user && userManager.getUser(req.session.user)?.isAdmin)
        next();
    else res.sendStatus(403);
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
    req.session.loggedIn = false;
    req.session.user = undefined;
    req.session.save((err) => {
        if (err) next(err);

        req.session.destroy((genErr) => {
            if (genErr) next(genErr);

            res.sendStatus(200);
        });
    });
};
