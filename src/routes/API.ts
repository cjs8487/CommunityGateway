import { Router } from 'express';

const api = Router();

api.get('/ping', (req, res) => {
    res.send('pong').status(200);
});

api.get('/version', (req, res) => {
    res.send(process.env.npm_package_version).status(200);
});

export default api;
