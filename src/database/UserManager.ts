import { Database } from 'better-sqlite3';
import { isAxiosError } from 'axios';
import { logError, logInfo } from '../Logger';
import { AuthData } from '../core/auth/AuthCore';
import { DiscordToken, refreshToken } from '../core/auth/DiscordTokens';

export type User = {
    id: number;
    hasDiscordAuth: boolean;
    discordId: string;
    isAdmin: boolean;
    authData?: AuthData;
    needsRefresh: boolean;
} | undefined;

type UserData = {
    id: number;
    hasDiscordAuth: boolean;
    isAdmin: boolean;
    refreshToken: string;
    discordId: string;
    needsRefresh: boolean;
}

type DBUser = {
    id: number;
    is_discord_auth: number;
    is_admin: number;
    refresh_token: string;
    discord_id: string;
    refresh_flag: number;
}

const toExternalForm = (user: DBUser): UserData => ({
    id: user.id,
    hasDiscordAuth: !!user.is_discord_auth,
    isAdmin: !!user.is_admin,
    refreshToken: user.refresh_token,
    discordId: user.discord_id,
    needsRefresh: !!user.refresh_flag,
});

export class UserManager {
    db: Database;
    users: Map<number, User>;
    discordMap: Map<string, User>;

    constructor(db: Database) {
        this.db = db;
        this.users = new Map();
        this.discordMap = new Map();

        this.getAllData().forEach(async (userData: UserData) => {
            const user: User = {
                id: userData.id,
                hasDiscordAuth: userData.hasDiscordAuth,
                isAdmin: userData.isAdmin,
                discordId: userData.discordId,
                needsRefresh: userData.needsRefresh,
                authData: {},
            };
            try {
                if (!user.authData) {
                    user.authData = {};
                }
                user.authData.discordToken = await refreshToken(userData.refreshToken);
            } catch (e) {
                let errorMessage = 'Error creating user from database cache - ';
                let log = true;
                if (isAxiosError(e)) {
                    if (e.response) {
                        errorMessage += `${e.response.data.error}.`;
                        // flag the user as needing an oauth refresh
                        if (e.response.status === 400) {
                            this.flagRefresh(user.id);
                            log = false;
                            logInfo(`Flagging user ${user.id} as needing refresh`);
                        }
                    } else {
                        errorMessage += 'this error occurred in a network request, but there was no response data';
                    }
                }

                errorMessage += ` User id: ${userData.id}`;
                if (log) {
                    logError(errorMessage);
                }
            }
            // check cached data
            // update cachess in database
            this.users.set(user.id, user);
            this.discordMap.set(user.discordId, user);
        });
    }

    getUser(user: number): User;
    getUser(user: string): User;

    getUser(user: number | string): User {
        if (typeof user === 'string') {
            return this.discordMap.get(user);
        }
        return this.users.get(user);
    }

    getUserData(user: number): User {
        const selectedUser: DBUser = this.db.prepare('select * from users where user_id=?').get(user);
        return toExternalForm(selectedUser);
    }

    getAllData(active?: boolean): UserData[] {
        let users: DBUser[];
        if (active) {
            users = this.db.prepare('select * from users where active=1').all();
        } else {
            users = this.db.prepare(`
                select
                    users.id,
                    users.is_discord_auth,
                    users.is_admin,
                    users.discord_id,
                    users.refresh_flag,
                    oauth.refresh_token
                from users
                join oauth on oauth.owner = users.id
            `).all();
        }
        return users.map((user: DBUser) => toExternalForm(user));
    }

    registerUser(discordId: string, discordAuth: boolean, admin: boolean, authData: AuthData): User {
        const userInsertResult = this.db.prepare(
            'insert into users (discord_id, is_discord_auth, is_admin) values (?, ?, ?)',
        ).run(discordId, discordAuth ? 1 : 0, admin ? 1 : 0);
        const id = userInsertResult.lastInsertRowid as number;
        if (authData.discordToken) {
            this.db.prepare(
                'insert into oauth (owner, target, refresh_token) values (?, ?, ?)',
            ).run(id, 'discord', authData.discordToken.refreshToken);
        }

        const user: User = {
            id,
            hasDiscordAuth: discordAuth,
            isAdmin: admin,
            authData,
            discordId,
            needsRefresh: false,
        };
        this.users.set(id, user);
        return user;
    }

    flagRefresh(id: number) {
        const user = this.users.get(id);
        if (!user) return;
        user.needsRefresh = true;
        this.db.prepare('update users set refresh_flag=1 where id=?').run(id);
    }

    clearRefresh(id: number) {
        const user = this.users.get(id);
        if (!user) return;
        user.needsRefresh = false;
        this.db.prepare('update users set refresh_flag=0 where id=?').run(id);
    }

    setAdmin(id: number, admin: boolean) {
        const user = this.users.get(id);
        if (!user) return;
        user.isAdmin = admin;
        this.db.prepare('update users set is_admin=? where id=?').run(admin ? 1 : 0, id);
    }

    updateDiscordAuth(id: number, token: DiscordToken) {
        const user = this.getUser(id);
        if (user && user.authData) {
            user.authData.discordToken = token;
        }
        this.db.prepare(
            'update oauth set refresh_token=? where owner=? and target=?',
        ).run(token.refreshToken, id, 'discord');
    }

    userExists(id: number): boolean;
    userExists(id: string): boolean;

    userExists(id: number | string) {
        if (typeof id === 'string') {
            return this.db.prepare('select id from users where discord_id=?').all(id).length > 0;
        }
        return this.users.has(id);
    }

    isAdmin(id: number) {
        return this.users.get(id)?.isAdmin;
    }
}
