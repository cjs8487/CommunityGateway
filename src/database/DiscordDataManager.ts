import { Database } from 'better-sqlite3';

export type DataSyncInfo = {
    type: string;
    guild: string;
    channel: string;
    messages: string[];
    format: string;
    key: string;
    secondaryKey?: string;
    groupKey?: string;
};

export type DataSyncKeys = {
    key: string;
    secondaryKey?: string;
    groupKey?: string;
};

export class DiscordDataManager {
    db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    saveDataSyncInfo(
        dataType: string,
        guild: string,
        channel: string,
        format: string,
        keys: DataSyncKeys,
        ...messages: string[]
    ) {
        const id = this.db
            .prepare(
                'insert into dynamic_data_sync (type, guild, channel, format, main_key) values (?, ?, ?, ?, ?)',
            )
            .run(dataType, guild, channel, format, keys.key).lastInsertRowid;
        messages.forEach((messageId) => {
            this.db
                .prepare(
                    'insert into dynamic_data_sync_messages (sync_id, message) values (?, ?)',
                )
                .run(id, messageId);
        });
    }

    getDataSyncInfo(type: string): DataSyncInfo[] {
        return this.db
            .prepare('select * from dynamic_data_sync where type=?')
            .all(type)
            .map((info) => ({
                type: info.type,
                guild: info.guild,
                channel: info.channel,
                format: info.format,
                key: info.main_key,
                secondaryKey: info.secondary_key,
                groupKey: info.group_key,
                messages: this.db
                    .prepare(
                        'select * from dynamic_data_sync_messages where sync_id=?',
                    )
                    .all(info.id)
                    .map((message) => message.message),
            }));
    }
}
