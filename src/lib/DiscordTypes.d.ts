export type Snowflake = string;

export type DiscordUser = {
    id: string;
    username: string;
    avatar: string;
};

export type GuildMember = {
    roles: Snowflake[];
    user: DiscordUser;
};

export type Role = {
    id: Snowflake;
    name: string;
    color: number;
    managed: boolean;
};

export type Guild = {
    id: Snowflake;
    name: string;
    roles: Role[];
    icon: string;
};

export type UserGuild = {
    id: Snowflake;
    name: string;
    owner: boolean;
    permissions: string;
    icon: string;
};
