-- TICKET-003: Tabla archivos
CREATE TABLE IF NOT EXISTS archivos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sala_id UUID NOT NULL REFERENCES salas(id) ON DELETE CASCADE,
    mensaje_id UUID REFERENCES mensajes(id) ON DELETE SET NULL,
    nombre_original VARCHAR(255) NOT NULL,
    ruta_storage VARCHAR(500) NOT NULL UNIQUE,
    mime_type VARCHAR(100) NOT NULL,
    tamanio_bytes BIGINT NOT NULL,
    subido_por_nickname VARCHAR(50) NOT NULL,
    subido_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);