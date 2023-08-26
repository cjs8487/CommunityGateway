import { Database } from 'better-sqlite3';

export type File = {
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
        this.db
            .prepare('insert into files (name, path) values (?, ?)')
            .run(name, path);
    }

    getFile(id: number): File | undefined {
        const dbValue = this.db
            .prepare('select * from files where id=?')
            .get(id);
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
            this.db
                .prepare('select * from files where name=? and path=?')
                .all(name, path).length > 0
        );
    }

    getAllFiles(): File[] {
        return this.db
            .prepare('select * from files')
            .all()
            .map((file) => ({
                id: file.id,
                name: file.name,
                path: file.path,
            }));
    }

    filesAtPath(path: string): File[] {
        return this.db
            .prepare('select * from files where path=?')
            .all(path)
            .map((file) => ({
                id: file.id,
                name: file.name,
                path: file.path,
            }));
    }

    deleteFile(fileId: number) {
        this.db.prepare('delete from files where id=?').run(fileId);
    }
}
