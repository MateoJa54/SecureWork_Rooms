Create table mensajes (
    id UUID primary key default gen_random_uuid(),
    sala_id UUID not null references salas(id) on delete cascade,
    nickname varchar(50) not null,
    contenido text not null check (length(contenido) <= 2000),
    enviado_en TIMESTAMPTZ not null default now()
);
CREATE INDEX idx_mensajes_sala_fecha ON mensajes(sala_id, enviado_en DESC);