import express from 'express';
import { logInfo } from './Logger';
import api from './routes/API';

const port = 8000;

const app = express();

// request logging
app.use((req, res, next) => {
    logInfo(`HTTP ${req.method} ${req.path}`);
    next();
});

app.use('/', api);

app.listen(port, async () => {
    logInfo(`CommunityGateway server listening on port ${port}`);
});

// process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));
