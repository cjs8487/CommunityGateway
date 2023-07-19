import path from 'path';
import express from 'express';
import session from 'express-session';
import SqliteStore from 'better-sqlite3-session-store';
import { logInfo } from './Logger';
import api from './routes/API';
import { sessionSecret, testing } from './Environment';
import { sessionsDb } from './System';

// redeclare express-session so that we can add our own types to the session data interface
declare module 'express-session' {
    interface SessionData {
        loggedIn: boolean;
        state?: string;
        user?: number;
    }
}

const port = 8000;

const app = express();

// request logging
app.use((req, res, next) => {
    if (!req.path.includes('/api')) {
        next();
        return;
    }
    logInfo(`HTTP ${req.method} ${req.path}`);
    next();
});

// session configuration
// testing is the inverse of the prouction flag, but also allows local testing with a prodution build
// cookie security and proxy only matter when in production
app.use(
    session({
        store: new (SqliteStore(session))({
            client: sessionsDb,
            expired: {
                clear: true,
                intervalMs: 90000,
            },
        }),
        secret: sessionSecret,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: !testing },
        proxy: !testing,
    }),
);

app.use('/api', api);

app.use(express.static('static'));

app.get('/*', (req, res) => {
    logInfo(`Client Request ${req.path}`);
    res.sendFile(path.join(__dirname, '../static', 'index.html'));
});

app.listen(port, async () => {
    logInfo(`CommunityGateway server listening on port ${port}`);
});
