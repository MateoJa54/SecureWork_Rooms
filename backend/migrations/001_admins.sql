create table administradores (
    id UUID primary key default gen_random_uuid(),
    usuario varchar(50) not null unique,
    password_hash varchar(255) not null,
    creado_en TIMESTAMPTZ not null default now(),
    ultimo_login TIMESTAMPTZ null
);