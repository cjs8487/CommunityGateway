-- SQLite
create table if not exists users (
    id integer primary key autoincrement
);

create table if not exists oauth (
    id integer primary key autoincrement,
    owner integer not null,
    target text not null,
    refresh_token not null,
    foreign key(owner) references users(id)
);

create table if not exists dynamic_data_types(
    id integer primary key autoincrement,
    name text not null unique
);

create table if not exists dynamic_data(
    id integer primary key autoincrement,
    type integer not null,
    data text not null,
    foreign key(type) references dynamic_data_types(id)
);