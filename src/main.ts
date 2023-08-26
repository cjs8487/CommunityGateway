import path from 'path';
import express from 'express';
import session from 'express-session';
import SqliteStore from 'better-sqlite3-session-store';
import { logInfo } from './Logger';
import api from './routes/API';
import { sessionSecret, testing } from './Environment';
import { fileManager, sessionsDb } from './System';
import { init } from './bots/discord/DiscordBot';

// redeclare express-session so that we can add our own types to the session data interface
declare module 'express-session' {
    interface SessionData {
        loggedIn: boolean;
        state?: string;
        target?: string;
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

app.get('/files/:fileId', (req, res) => {
    logInfo(`Client File Request ${req.path}`);
    const { fileId } = req.params;
    const fileIdNum = Number(fileId);
    if (Number.isNaN(fileIdNum)) {
        res.status(400).send('Invalid file');
    }
    const file = fileManager.getFile(fileIdNum);
    if (!file) {
        res.status(404).send();
        return;
    }
    const filePath = `/${file.path}/${file.name}`;
    res.sendFile(path.join(__dirname, '../files', filePath));
});

app.get('/*', (req, res) => {
    logInfo(`Client Request ${req.path}`);
    res.sendFile(path.join(__dirname, '../static', 'index.html'));
});

app.listen(port, async () => {
    logInfo(`CommunityGateway server listening on port ${port}`);
});

init();
