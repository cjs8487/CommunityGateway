-- SQLite
create table if not exists users (
    id integer primary key autoincrement,
    is_discord_auth integer,
    is_admin integer,
    discord_id text,
    refresh_flag integer
);

create table if not exists oauth (
    id integer primary key autoincrement,
    owner integer not null,
    target text not null,
    refresh_token not null,
    foreign key(owner) references users(id) on delete cascade
);

create table if not exists dynamic_data_types(
    id integer primary key autoincrement,
    name text not null unique
);

create table if not exists dynamic_data(
    id integer primary key autoincrement,
    type integer not null,
    data text not null,
    foreign key(type) references dynamic_data_types(id) on delete cascade
);

create table if not exists asyncs (
    id integer primary key autoincrement,
    name text not null,
    permalink text not null,
    hash text not null,
    creator integer not null,
    foreign key(creator) references(users)
);

create table if not exists async_submissions (
    id integer primary key autoincrement,
    race integer not null,
    user intger not null,
    time string not null,
    comment text,
    foreign key(race) references(asyncs) on delete cascade,
    foreign key(user) references(users)
);