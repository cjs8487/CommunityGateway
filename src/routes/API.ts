import bodyParser from 'body-parser';
import { Router } from 'express';
import dynamicData from './dynamicdata/DynamicData';

const api = Router();

api.use(bodyParser.json());

api.get('/ping', (req, res) => {
    res.send('pong').status(200);
});

api.get('/version', (req, res) => {
    res.send(process.env.npm_package_version).status(200);
});

api.use('/dynamicdata', dynamicData);

export default api;
