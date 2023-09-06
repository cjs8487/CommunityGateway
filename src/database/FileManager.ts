import { Database } from './core/Database';

export type File = {
    id: number;
    name: string;
    path: string;
};

type DBFile = {
    id: number;
    name: string;
    path: string;
};

export class FileManager {
    db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    createFile(name: string, path: string) {
        return this.db.run(
            'insert into files (name, path) values (?, ?)',
            name,
            path,
        ).lastInsertRowid;
    }

    getFile(id: number): File | undefined {
        const dbValue: DBFile = this.db.get(
            'select * from files where id=?',
            id,
        );
        if (dbValue) {
            return {
                id: dbValue.id,
                name: dbValue.name,
                path: dbValue.path,
            };
        }
        return undefined;
    }

    fileWithNameExistsInPath(name: string, path: string) {
        return (
            this.db.all(
                'select * from files where name=? and path=?',
                name,
                path,
            ).length > 0
        );
    }

    getAllFiles(): File[] {
        return this.db.all<DBFile>('select * from files').map((file) => ({
            id: file.id,
            name: file.name,
            path: file.path,
        }));
    }

    filesAtPath(path: string): File[] {
        return this.db
            .all<DBFile>('select * from files where path=?', path)
            .map((file) => ({
                id: file.id,
                name: file.name,
                path: file.path,
            }));
    }

    deleteFile(fileId: number) {
        this.db.run('delete from files where id=?', fileId);
    }
}
