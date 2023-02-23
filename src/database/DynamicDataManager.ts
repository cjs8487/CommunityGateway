import { Database } from 'better-sqlite3';

type DynamicDataType = {
    id: number;
    name: string;
}

export type DynamicData = {
    id: number;
    data: string;
}

export class DynamicDataManager {
    db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    insertData(type: DynamicDataType, data: string) {
        this.db.prepare('insert into dynamic_data (type, data) values (?, ?)').run(type.id, data);
    }

    deleteData(id: number): number {
        return this.db.prepare('delete from dynamic_data where id=?').run(id).changes;
    }

    getAllData(type: string): DynamicData[] {
        return this.db.prepare(
            'select data.id, data.data ' +
            'from dynamic_data data ' +
            'join dynamic_data_types types on types.id = data.type ' +
            'where types.name=?',
        ).all(type).map((data) => ({
            id: data.id,
            data: JSON.parse(data.data),
        }));
    }

    createType(name: string) {
        this.db.prepare('insert into dynamic_data_types (name) values (?)').run(name);
    }

    getType(name: string): DynamicDataType {
        return this.db.prepare('select * from dynamic_data_types where name=?').get(name);
    }

    deleteType(name: string): number {
        return this.db.prepare('delete from dynamic_data_types where name=?').run(name).changes;
    }

    getAllTypes(): DynamicDataType[] {
        return this.db.prepare('select * from dynamic_data_types').all();
    }
}
