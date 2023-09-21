import { Router } from 'express';

const discordManagement = Router();

// manage discord data sources
discordManagement.get('/servers', (req, res) => {
    res.sendStatus(200);
});

discordManagement.post('/servers', (req, res) => {
    res.sendStatus(200);
});

discordManagement.delete('/servers', (req, res) => {
    res.sendStatus(200);
});

export default discordManagement;
