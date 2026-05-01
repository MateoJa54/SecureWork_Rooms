-- TICKET-003: Tabla mensajes
CREATE TABLE IF NOT EXISTS mensajes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sala_id UUID NOT NULL REFERENCES salas(id) ON DELETE CASCADE,
    nickname VARCHAR(50) NOT NULL,
    contenido TEXT NOT NULL CHECK (length(contenido) <= 2000),
    enviado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mensajes_sala_fecha 
    ON mensajes(sala_id, enviado_en DESC);