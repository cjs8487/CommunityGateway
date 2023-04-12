export type Snowflake = string;

export type GuildMember = {
    roles: Snowflake[];
}

export type DiscordUser = {
    id: string;
    username: string;
    avatar: string;
};
