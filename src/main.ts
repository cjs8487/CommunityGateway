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
