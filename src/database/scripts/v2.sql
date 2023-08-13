-- SQLite
create table if not exists dynamic_data_sync (
    id integer primary key autoincrement,
    type string not null,
    guild text not null,
    channel text not null,
    format string not null,
    main_key string not null,
    secondary_key string,
    group_key string
);

create table if not exists dynamic_data_sync_messages (
    id integer primary key autoincrement,
    sync_id integer not null,
    message text not null,
    foreign key(sync_id) references dynamic_data_sync(id) on delete cascade
);

alter table dynamic_data_types add column shape text not null default ""