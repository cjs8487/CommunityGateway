import { Database as DB, Statement } from 'better-sqlite3';
import { Database, RunResult } from './Database';

export default class SQLiteDatabase extends Database {
    db: DB;
    prepared: Map<string, Statement>;

    constructor(db: DB) {
        super();
        this.db = db;
        this.prepared = new Map();
    }

    private prepare(sql: string): Statement {
        if (this.prepared.has(sql)) {
            const statement = this.prepared.get(sql);
            if (statement) return statement;
        }
        const statement = this.db.prepare<string>(sql);
        this.prepared.set(sql, statement);
        return statement;
    }

    run(sql: string, ...params: unknown[]): RunResult {
        const statement = this.prepare(sql);
        const result = statement.run(...params);
        return {
            changes: result.changes,
            lastInsertRowid: result.lastInsertRowid,
        };
    }

    get<R>(sql: string, ...params: unknown[]): R {
        return this.prepare(sql).get(params);
    }

    all<R>(sql: string, ...params: unknown[]): R[] {
        return this.prepare(sql).all(params);
    }
}
