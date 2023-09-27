import { readFileSync } from 'fs';
import { writeFile } from 'fs/promises';

export type DiscordConnection = {
    id: string;
    name: string;
    icon: string;
    botConnected: boolean;
    enabled: boolean;
    adminRole?: string;
};

export type Config = {
    servers: DiscordConnection[];
    serverIds: string[];
    superusers: string[];
};

const serversFile = 'config/servers.json';
const superusersFile = 'config/superusers.json';

export const loadConfig = (): Config => {
    const servers: DiscordConnection[] = JSON.parse(
        readFileSync(serversFile).toString(),
    );
    const superusers = JSON.parse(readFileSync(superusersFile).toString());
    return {
        servers,
        serverIds: servers.map((server) => server.id),
        superusers,
    };
};

export const writeConfig = async (config: Config) => {
    await writeFile(serversFile, JSON.stringify(config.servers));
    await writeFile(superusersFile, JSON.stringify(config.superusers));
};
