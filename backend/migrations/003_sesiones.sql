CREATE table sesiones_activas (
    id UUID primary key default gen_random_uuid(),
    sala_id UUID not null references salas(id) on delete cascade,
    nickname varchar(50) not null,
    ip varchar(45) not null,
    socket_id varchar(255) not null unique,
    sessions_token varchar(255) not null unique,
    ultima_actividad TIMESTAMPTZ not null default now(),
    conectado_en TIMESTAMPTZ not null default now()
);