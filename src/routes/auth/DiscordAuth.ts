import { Router } from 'express';
import { exchangeCode } from '../../core/auth/DiscordTokens';

const discordAuth = Router();

discordAuth.post('/authorized', async (req, res) => {
    const { code } = req.body;
    try {
        const token = await exchangeCode(code);
        req.session.loggedIn = true;
        req.session.token = token.accessToken;
        req.session.refresh = token.refreshToken;
    } catch (e) {
        res.status(500).send();
        return;
    }
    res.status(200).send();
});

export default discordAuth;
