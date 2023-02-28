import axios from 'axios';
import { discordClientId, discordClientSecret } from '../../Environment';

export type DiscordToken = {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    refreshToken: string;
    scope: string;
}

const responseDataToTokenObject = (data: Record<string, string>): DiscordToken => ({
    accessToken: data.access_token,
    tokenType: data.token_type,
    expiresIn: Number(data.expires_in),
    refreshToken: data.refresh_token,
    scope: data.scope,
});

export const exchangeCode = async (code: string): Promise<DiscordToken> => {
    const { data } = await axios.post('https://discord.com/api/v10/oauth2/token', {
        client_id: discordClientId,
        client_secret: discordClientSecret,
        grant_type: 'authorization_code',
        code,
        redirect_uri: 'http://localhost:3000/community',
    }, {
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
        },
    });
    return responseDataToTokenObject(data);
};

export const refreshToken = async (token: string): Promise<DiscordToken> => {
    const { data } = await axios.post('https://discord.com/api/v10/oauth2/token', {
        client_id: discordClientId,
        client_secret: discordClientSecret,
        grant_type: 'refresh_token',
        refresh_token: token,
    }, {
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
        },
    });
    return responseDataToTokenObject(data);
};

// basic token retreival - queries the database and memory stores for an existing token for the user and then
// checks if it's valid if the token is valid nothing additional happens, but if the token is expired the
// refresh token will be used to get a new one and the database will be updated
export const getToken = async () => undefined;
