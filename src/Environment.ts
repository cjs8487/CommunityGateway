import 'dotenv/config';

export const discordClientId = process.env.DISCORD_CLIENT_ID ?? '';
export const discordClientSecret = process.env.DISCORD_CLIENT_SECRET ?? '';

export const testing = !!process.env.testing;
