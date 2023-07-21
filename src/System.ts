import { readFileSync } from 'fs';
import Database, { Database as DB } from 'better-sqlite3';
import { testing } from './Environment';
import { logInfo, logVerbose } from './Logger';
import { DynamicDataManager } from './database/DynamicDataManager';
import { UserManager } from './database/UserManager';
// eslint-disable-next-line import/no-cycle
import { AsyncManager } from './database/AsyncManager';

const db: DB = testing
    ? new Database('database.db', { verbose: logVerbose })
    : new Database('database.db');
if (testing) {
    logInfo('db verbose enabled');
}

// database setup
db.exec('pragma foreign_keys=off');
const dbScriptDir = 'src/database/scripts';
const tables = db
    .prepare("select name from sqlite_master where type='table'")
    .all()
    .filter((table: { name: string }) => !table.name.startsWith('sqlite_'))
    .map((table: { name: string }) => table.name);
tables.forEach((table) => {
    logInfo(`Backing up ${table}`);
    db.exec(`drop table if exists ${table}_temp`);
    db.exec(`create table ${table}_temp as select * from ${table}`);
    db.exec(`drop table ${table}`);
});

logInfo('Running database initialization');
const setupScript = readFileSync(`${dbScriptDir}/dbsetup.sql`, 'utf-8');
db.exec(setupScript);

tables.forEach((table) => {
    logInfo(`Restoring ${table} from backup and cleaning up`);
    db.exec(`insert into ${table} select * from ${table}_temp`);
    db.exec(`drop table ${table}_temp`);
});
db.exec('pragma foreign_keys=on');

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
