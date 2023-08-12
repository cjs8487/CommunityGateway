import { readFileSync, readdirSync, copyFileSync } from 'fs';
import Database, { Database as DB } from 'better-sqlite3';
import { testing } from './Environment';
import { logInfo, logVerbose } from './Logger';
import { DynamicDataManager } from './database/DynamicDataManager';
import { UserManager } from './database/UserManager';
// eslint-disable-next-line import/no-cycle
import { AsyncManager } from './database/AsyncManager';
import { DiscordDataManager } from './database/DiscordDataManager';

// database setup
// this setup sequence makes several assumptions
//  - the existence of the directory src/database/scripts
//  - the directory contains ONLY files named v1...vx, where v1 is the base script
//          and the following scripts modify existing properties
//  - the files are named sequentially
//  - no files touch the user_version pragma; it is maintained as part of this sequence
//
// Additionally, the sequence makes a concession when the testing environment variable is set.
// When set, before beginning the migration sequence, the database will be copied from a backup
// file, and the sequence will set the stored version back by one. It is assumed that the backup
// will always be the result of the second to last migration script being run. This allows the
// database to kept in sync during the dev cycle without making manual changes to it
logInfo('starting database migration');
if (testing) {
    logInfo('copying database from backup');
    copyFileSync('db backup.db', 'database.db');
}

const db: DB = testing
    ? new Database('database.db', { verbose: logVerbose })
    : new Database('database.db');
if (testing) {
    logInfo('db verbose enabled');
}

const dbVersion: number = db.pragma('user_version', { simple: true });
const dbScriptDir = 'src/database/scripts';
const migrationFileNames = readdirSync(dbScriptDir).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
);
migrationFileNames.forEach((migrationFileName, index) => {
    if (dbVersion > index) return;
    logInfo(`migrating with script ${migrationFileName}`);
    const script = readFileSync(`${dbScriptDir}/${migrationFileName}`, 'utf-8');
    db.exec(script);
});
const newVersion = migrationFileNames.length;
db.pragma(`user_version=${newVersion}`);
logInfo(`database migrated to v${newVersion}`);

if (testing) {
    logInfo('un-migrating database by one version');
    db.pragma(`user_version=${newVersion - 1}`);
}

// db.exec('pragma foreign_keys=off');
// const dbScriptDir = 'src/database/scripts';
// const tables = db
//     .prepare("select name from sqlite_master where type='table'")
//     .all()
//     .filter((table: { name: string }) => !table.name.startsWith('sqlite_'))
//     .map((table: { name: string }) => table.name);
// tables.forEach((table) => {
//     logInfo(`Backing up ${table}`);
//     db.exec(`drop table if exists ${table}_temp`);
//     db.exec(`create table ${table}_temp as select * from ${table}`);
//     db.exec(`drop table ${table}`);
// });

// logInfo('Running database initialization');
// const setupScript = readFileSync(`${dbScriptDir}/dbsetup.sql`, 'utf-8');
// db.exec(setupScript);

// tables.forEach((table) => {
//     logInfo(`Restoring ${table} from backup and cleaning up`);
//     db.exec(`insert into ${table} select * from ${table}_temp`);
//     db.exec(`drop table ${table}_temp`);
// });
// db.exec('pragma foreign_keys=on');

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
export const discordDataManager = new DiscordDataManager(db);

export default {};
