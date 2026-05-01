-- TICKET-003: Tabla sesiones_activas
-- device_id UNIQUE GLOBAL = un dispositivo en una sola sala a la vez
CREATE TABLE IF NOT EXISTS sesiones_activas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sala_id UUID NOT NULL REFERENCES salas(id) ON DELETE CASCADE,
    nickname VARCHAR(50) NOT NULL,
    device_id VARCHAR(64) NOT NULL,
    fingerprint VARCHAR(128) NOT NULL,
    ip VARCHAR(45) NOT NULL,
    socket_id VARCHAR(255) NOT NULL,
    session_token VARCHAR(255) NOT NULL,
    ultima_actividad TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    conectado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (device_id),
    UNIQUE (socket_id),
    UNIQUE (session_token),
    UNIQUE (sala_id, nickname)
);