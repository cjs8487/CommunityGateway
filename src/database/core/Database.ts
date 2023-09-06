export type RunResult = {
    changes: number;
    lastInsertRowid: number | bigint;
};

export abstract class Database {
    abstract run(sql: string, ...params: unknown[]): RunResult;
    abstract get<R>(sql: string, ...params: unknown[]): R;
    abstract all<R>(sql: string, ...params: unknown[]): R[];
}
