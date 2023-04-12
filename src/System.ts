import { readFileSync } from 'fs';
import Database, { Database as DB } from 'better-sqlite3';
import { testing } from './Environment';
import { logInfo, logVerbose } from './Logger';
import { DynamicDataManager } from './database/DynamicDataManager';
import { UserManager } from './database/UserManager';
// eslint-disable-next-line import/no-cycle
import { AsyncManager } from './database/AsyncManager';

const db: DB = testing ? new Database('database.db', { verbose: logVerbose }) : new Database('database.db');
if (testing) {
    logInfo('db verbose enabled');
}

const setupScript = readFileSync('src/dbsetup.sql', 'utf-8');
db.exec(setupScript);

export const sessionsDb: DB = new Database('sessions.db');

// link kill signals to exit to ensure cleanup processes run
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));

// Ensure the database connection closes when the process terminates
process.on('exit', () => db.close());

export const userManager = new UserManager(db);
export const dynamicDataManager = new DynamicDataManager(db);
export const asyncManager = new AsyncManager(db);

export default {};
