import { Database } from './core/Database';

export type DataSyncInfo = {
    id: number;
    type: string;
    guild: string;
    channel: string;
    messages: string[];
    format: string;
    key: string;
    secondaryKey?: string;
    groupKey?: string;
};

type DBSyncInfo = {
    id: number;
    type: string;
    guild: string;
    channel: string;
    format: string;
    main_key: string;
    secondary_key?: string;
    group_key?: string;
};

type DBMessage = {
    id: number;
    message: string;
};

type DBForumAutoAdd = {
    user: string;
    channel: string;
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
        const id = this.db.run(
            'insert into dynamic_data_sync (type, guild, channel, format, main_key, secondary_key, group_key) ' +
                'values (?, ?, ?, ?, ?, ?, ?)',

            dataType,
            guild,
            channel,
            format,
            keys.key,
            keys.secondaryKey,
            keys.groupKey,
        ).lastInsertRowid;
        messages.forEach((messageId) => {
            this.db.run(
                'insert into dynamic_data_sync_messages (sync_id, message) values (?, ?)',
                id,
                messageId,
            );
        });
    }

    getDataSyncInfo(type: string): DataSyncInfo[] {
        return this.db
            .all<DBSyncInfo>(
                'select * from dynamic_data_sync where type=?',
                type,
            )
            .map((info) => ({
                id: info.id,
                type: info.type,
                guild: info.guild,
                channel: info.channel,
                format: info.format,
                key: info.main_key,
                secondaryKey: info.secondary_key,
                groupKey: info.group_key,
                messages: this.db
                    .all<DBMessage>(
                        'select * from dynamic_data_sync_messages where sync_id=?',
                        info.id,
                    )
                    .map((message) => message.message),
            }));
    }

    clearSyncForChannel(channel: string): string[] {
        const messages = this.db.all<string>(
            'select m.message ' +
                'from dynamic_data_sync s ' +
                'join dynamic_data_sync_messages m on s.id=m.sync_id ' +
                'where channel=?',
            channel,
        );
        this.db.run('delete from dynamic_data_sync where channel=?', channel);
        return messages;
    }

    addMessageToSyncGroup(syncId: number, messageId: string) {
        this.db.run(
            'insert into dynamic_data_sync_messages (sync_id, message) values (?, ?)',
            syncId,
            messageId,
        );
    }

    channelHasSyncGroup(channel: string) {
        return (
            this.db.all(
                'select * from dynamic_data_sync where channel=?',
                channel,
            ).length > 0
        );
    }

    getUsersToAutoAdd(channel: string): string[] {
        return this.db
            .all<DBForumAutoAdd>(
                'select user from forum_auto_add where channel=?',
                channel,
            )
            .map((result) => result.user);
    }

    addUserToAutoAdd(channel: string, user: string) {
        this.db.run(
            'insert into forum_auto_add (channel, user) values (?, ?)',
            channel,
            user,
        );
    }

    deleteUserAutoAdd(channel: string, user: string) {
        this.db.run(
            'delete from forum_auto_add where channel=? and user=?',
            channel,
            user,
        );
    }

    clearUserAutoAdd(user: string) {
        return this.db.run('delete from forum_auto_add where user=?', user)
            .changes;
    }

    channelsUserAutoAddedTo(user: string): string[] {
        return this.db
            .all<DBForumAutoAdd>(
                'select channel from forum_auto_add where user=?',
                user,
            )
            .map((result) => result.channel);
    }
}
