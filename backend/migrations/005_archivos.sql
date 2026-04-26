Create table archivos (
    id UUID primary key default gen_random_uuid(),
    sala_id UUID not null references salas(id) on delete cascade,
    mensaje_id UUID null references mensajes(id) on delete set null,
    nombre_original varchar(255) not null,
    ruta_storage varchar(500) not null unique,
    mime_type varchar(100) not null,
    tamano_byte bigint not null,
    subido_por_nickname varchar(50) not null,
    subido_en TIMESTAMPTZ not null default now()
);