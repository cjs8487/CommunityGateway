-- SQLite
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