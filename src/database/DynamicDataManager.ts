import { Database } from './core/Database';

type DynamicDataType = {
    id: number;
    name: string;
    shape: string;
};

export type DynamicData = {
    id: number;
    data: string;
};

type DBData = {
    id: number;
    data: string;
};

export class DynamicDataManager {
    db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    insertData(type: DynamicDataType, data: string) {
        this.db.run(
            'insert into dynamic_data (type, data) values (?, ?)',
            type.id,
            data,
        );
    }

    updateData(id: number, data: string) {
        return this.db.run(
            'update dynamic_data set data=? where id=?',
            data,
            id,
        ).changes;
    }

    deleteData(id: number): number {
        return this.db.run('delete from dynamic_data where id=?', id).changes;
    }

    getAllData(type: string): DynamicData[] {
        return this.db
            .all<DBData>(
                'select data.id, data.data ' +
                    'from dynamic_data data ' +
                    'join dynamic_data_types types on types.id = data.type ' +
                    'where types.name=?' +
                    'order by data.sort_val, data.id',
                type,
            )
            .map((data) => ({
                id: data.id,
                data: data.data,
            }));
    }

    createType(name: string, shape: string) {
        this.db.run(
            'insert into dynamic_data_types (name, shape) values (?, ?)',
            name,
            shape,
        );
    }

    getType(name: string): DynamicDataType | undefined {
        return this.db.get(
            'select * from dynamic_data_types where name=?',
            name,
        );
    }

    deleteType(name: string): number {
        return this.db.run('delete from dynamic_data_types where name=?', name)
            .changes;
    }

    getAllTypes(): DynamicDataType[] {
        return this.db.all('select * from dynamic_data_types');
    }

    getTypeForData(id: number): string {
        return this.db.get<DynamicDataType>(
            'select name ' +
                'from dynamic_data data ' +
                'join dynamic_data_types types on types.id = data.type ' +
                'where data.id = ?',
            id,
        ).name;
    }

    updateOrder(type: string, newOrder: number[]) {
        newOrder.forEach((id, index) => {
            this.db.run(
                'update dynamic_data set sort_val=? where id=?',
                index,
                id,
            );
        });
    }
}
