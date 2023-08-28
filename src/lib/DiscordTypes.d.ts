export type Snowflake = string;

export type GuildMember = {
    roles: Snowflake[];
};

export type DiscordUser = {
    id: string;
    username: string;
    avatar: string;
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
};
