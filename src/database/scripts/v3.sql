create table files (
    id integer primary key autoincrement,
    name string not null,
    path string not null
);

create table security_roles (
    id integer primary key autoincrement,
    role_id text unique not null,
    enabled integer
);

create table security_points (
    id integer PRIMARY key autoincrement,
    role integer not null,
    permission text not null,
    enabled integer not null,
    foreign key(role) references security_roles(id) on delete cascade
);