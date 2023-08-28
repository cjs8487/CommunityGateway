import { Database } from 'better-sqlite3';

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

export class SecurityManager {
    db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    getAllRoles(): SecurityRole[] {
        return this.db
            .prepare('select * from security_roles')
            .all()
            .map((role) => ({
                id: role.id,
                roleId: role.role_id,
                enabled: !!role.enabled,
                points: this.db
                    .prepare('select * from security_points where role=?')
                    .all(role.id)
                    .map((point) => ({
                        id: point.id,
                        permission: point.permission,
                        enabled: !!point.enabled,
                    })),
            }));
    }

    createRole(roleId: string) {
        this.db
            .prepare(
                'insert into security_roles (role_id, enabled) values (?, 1)',
            )
            .run(roleId);
    }

    deleteRole(id: number) {
        this.db.prepare('delete from security_roles where id=?').run(id);
    }

    roleHasData(roleId: string) {
        return (
            this.db
                .prepare('select id from security_roles where role_id=?')
                .all(roleId).length > 0
        );
    }

    roleExists(id: number) {
        return (
            this.db.prepare('select id from security_roles where id=?').all(id)
                .length > 0
        );
    }

    setRoleEnabled(id: number, enabled: boolean) {
        this.db
            .prepare('update security_roles set enabled=? where id=?')
            .run(enabled ? 1 : 0, id);
    }

    setPointEnabled(id: number, enabled: boolean) {
        this.db
            .prepare('update security_points set enabled=? where id=?')
            .run(enabled ? 1 : 0, id);
    }

    setDiscordRole(id: number, role: string) {
        this.db
            .prepare('update security_roles set role_id=? where id=?')
            .run(role, id);
    }
}
