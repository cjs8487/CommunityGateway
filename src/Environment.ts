import 'dotenv/config';

export const discordApiRoot = 'https://discord.com/api/v10';

export const discordClientId = process.env.DISCORD_CLIENT_ID ?? '';
export const discordClientSecret = process.env.DISCORD_CLIENT_SECRET ?? '';
export const discordRedirect = process.env.DISCORD_REDIRECT ?? '';
export const discordServer = process.env.DISCORD_SERVER ?? '';
export const discordAdminRole = process.env.DISCORD_ADMIN_ROLE ?? '';
export const discordBotToken = process.env.DISCORD_BOT_TOKEN ?? '';
export const discordCommandServerId =
    process.env.DISCORD_COMMAND_SERVER_ID ?? '';
export const discordAdminOverride = process.env.DISCORD_ADMIN_OVERRIDE;

export const sessionSecret = process.env.SESSION_SECRET ?? '';

export const testing = !!process.env.testing;
