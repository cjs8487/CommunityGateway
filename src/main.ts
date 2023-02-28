import express from 'express';
import session from 'express-session';
import { logInfo } from './Logger';
import api from './routes/API';
import { testing } from './Environment';

// redeclare express-session so that we can add our own types to the session data interface
declare module 'express-session' {
    interface SessionData {
        loggedIn: boolean;
        token: string;
        refresh: string;
    }
}

const port = 8000;

const app = express();

// request logging
app.use((req, res, next) => {
    logInfo(`HTTP ${req.method} ${req.path}`);
    next();
});

// session configuration
// testing is the inverse of the prouction flag, but also allows local testing with a prodution build
// cookie security and proxy only matter when in production
app.use(session({
    secret: 'abc',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: !testing },
    proxy: !testing,
}));

app.use('/api', api);

app.listen(port, async () => {
    logInfo(`CommunityGateway server listening on port ${port}`);
});
