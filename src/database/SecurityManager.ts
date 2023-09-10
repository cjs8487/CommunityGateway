import axios from 'axios';
import { Guild, Role } from '../lib/DiscordTypes';
import { discordApiRoot, discordBotToken, discordServer } from '../Environment';
import { logInfo } from '../Logger';
import { userManager } from '../System';
import { User } from './UserManager';
import { Database } from './core/Database';
import { getGuildMember } from '../external/discord/DiscordApi';

export type SecurityPoint = {
    id: number;
    permission: string;
    enabled: boolean;
};

export type SecurityRole = {
    id: number;
    roleId: string;
    enabled: boolean;
    points: SecurityPoint[];
};

type DBRole = {
    id: number;
    role_id: string;
    enabled: number;
};

type DBPoint = {
    id: number;
    permission: string;
    enabled: number;
};

const permissions = [
    'Manage Dynamic Data',
    'Manage Asyncs',
    'Manage Content Pages',
];

export class SecurityManager {
    db: Database;

    allRoles: Role[] = [];
    availableRoles: Role[] = [];

    securityCache: Map<number, string[]>;
    canCheck: Map<number, boolean>;

    constructor(db: Database) {
        this.db = db;

        // role initialization
        const res = axios.get<Guild>(
            `${discordApiRoot}/guilds/${discordServer}`,
            {
                headers: {
                    Authorization: `Bot ${discordBotToken}`,
                },
            },
        );

        // asynchronous initialization - this information isn't needed
        // immediately following initialization but is utilized later and during
        // normal program runtime operations
        res.then(({ data: guild }) => {
            logInfo('Security Manager Entering Second Phase Initialization');
            this.allRoles = guild.roles.filter(
                (role) => !role.managed && role.name !== '@everyone',
            );

            const allRoleIds = this.allRoles.map((role) => role.id);
            const assignedRoles: string[] = [];
            this.getAllRoles().forEach((role) => {
                if (!allRoleIds.includes(role.roleId)) {
                    logInfo(
                        `Deleting stale role ${role.id} from security mapping`,
                    );
                    this.deleteRole(role.id);
                    return;
                }
                const foundPoints: string[] = [];
                role.points.forEach((point) => {
                    if (!permissions.includes(point.permission)) {
                        logInfo(
                            `Deleting state permission ${point.permission} from security role ${role.id}`,
                        );
                        this.db.run(
                            'delete from security_points where id=?',
                            point.id,
                        );
                    }
                    foundPoints.push(point.permission);
                });
                permissions.forEach((permission) => {
                    if (!foundPoints.includes(permission)) {
                        this.db.run(
                            'insert into security_points (role, permission, enabled) values (?, ?, 1)',
                            role.id,
                            permission,
                        );
                    }
                });
                assignedRoles.push(role.roleId);
            });

            this.availableRoles = this.allRoles.filter(
                (role) => !assignedRoles.includes(role.id),
            );
            logInfo('Security Manager Second Phase Initialization complete');
        });

        // synchronous initialization - this is data that may be needed right
        // away by any other part of the application. The crucial part of this
        // is the security cache which manages permission checks
        //
        // tech note - this is technically an asynchronous block
        this.securityCache = new Map();
        this.canCheck = new Map();
        userManager.users.forEach(async (user) => {
            this.setGrantsForUser(user);
        });
    }

    async setGrantsForUser(user: User, skipOverride = false) {
        // skip override forces the check to occur
        const canSkip =
            this.securityCache.get(user.id) !== undefined && !skipOverride;
        if (canSkip && !this.canCheck.get(user.id)) {
            return;
        }
        const discordUser = await getGuildMember(discordServer, user.discordId);
        const grants: string[] = [];
        discordUser.roles.forEach((roleId) => {
            const role = this.getRoleForDiscordRole(roleId);
            if (!role) return;
            role.points.forEach((point) => {
                if (grants.length === permissions.length) return;
                if (point.enabled && !grants.includes(point.permission)) {
                    grants.push(point.permission);
                }
            });
        });
        this.securityCache.set(user.id, grants);
        this.canCheck.set(user.id, false);
        setTimeout(() => this.canCheck.set(user.id, true), 15 * 60 * 1000);
    }

    getAllRoles(): SecurityRole[] {
        return this.db
            .all<DBRole>('select * from security_roles')
            .map((role) => ({
                id: role.id,
                roleId: role.role_id,
                enabled: !!role.enabled,
                points: this.db
                    .all<DBPoint>(
                        'select * from security_points where role=?',
                        role.id,
                    )
                    .map((point) => ({
                        id: point.id,
                        permission: point.permission,
                        enabled: !!point.enabled,
                    })),
            }));
    }

    getRole(id: number): SecurityRole {
        const role = this.db.get<DBRole>(
            'select * from security_roles where id=?',
            id,
        );
        return {
            id: role.id,
            roleId: role.role_id,
            enabled: !!role.enabled,
            points: this.db
                .all<DBPoint>(
                    'select * from security_points where role=?',
                    role.id,
                )
                .map((point) => ({
                    id: point.id,
                    permission: point.permission,
                    enabled: !!point.enabled,
                })),
        };
    }

    getRoleForDiscordRole(roleId: string): SecurityRole | undefined {
        const role: DBRole = this.db.get(
            'select * from security_roles where role_id=?',
            roleId,
        );
        if (!role) return undefined;
        return {
            id: role.id,
            roleId: role.role_id,
            enabled: !!role.enabled,
            points: this.db
                .all<DBPoint>(
                    'select * from security_points where role=?',
                    role.id,
                )
                .map((point) => ({
                    id: point.id,
                    permission: point.permission,
                    enabled: !!point.enabled,
                })),
        };
    }

    createRole(roleId: string) {
        const newRole = this.db.run(
            'insert into security_roles (role_id, enabled) values (?, 1)',
            roleId,
        ).lastInsertRowid;
        permissions.forEach((permission) => {
            this.db.run(
                'insert into security_points (role, permission, enabled) values (?, ?, 1)',
                newRole,
                permission,
            );
        });
        this.availableRoles.splice(
            this.availableRoles.findIndex((role) => role.id === roleId),
            1,
        );
    }

    deleteRole(id: number) {
        const oldRole = this.getRole(id);
        const pushRole = this.allRoles.find(
            (role) => role.id === oldRole.roleId,
        );
        if (pushRole) {
            this.availableRoles.push(pushRole);
        }
        this.db.run('delete from security_roles where id=?', id);
    }

    roleHasData(roleId: string) {
        return (
            this.db.all('select id from security_roles where role_id=?', roleId)
                .length > 0
        );
    }

    roleExists(id: number) {
        return (
            this.db.all('select id from security_roles where id=?', id).length >
            0
        );
    }

    setRoleEnabled(id: number, enabled: boolean) {
        this.db.run(
            'update security_roles set enabled=? where id=?',
            enabled ? 1 : 0,
            id,
        );
    }

    setPointEnabled(id: number, enabled: boolean) {
        this.db.run(
            'update security_points set enabled=? where id=?',
            enabled ? 1 : 0,
            id,
        );
    }

    setDiscordRole(id: number, role: string) {
        this.db.run('update security_roles set role_id=? where id=?', role, id);
    }

    roleIsValid(roleId: string) {
        if (!this.availableRoles.find((role) => role.id === roleId)) {
            return false;
        }
        return true;
    }

    getDiscordRole(id: string) {
        return this.allRoles.find((role) => role.id === id);
    }
}
