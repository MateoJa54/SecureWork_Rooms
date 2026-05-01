-- TICKET-003: Tabla salas
DO $$ BEGIN
  CREATE TYPE tipo_sala AS ENUM ('texto', 'multimedia');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS salas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    tipo tipo_sala NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    pin_plano VARCHAR(10) NOT NULL,
    max_file_size_mb INTEGER NOT NULL DEFAULT 10 CHECK (max_file_size_mb > 0 AND max_file_size_mb <= 10),
    timeout_inactividad_min INTEGER NOT NULL DEFAULT 5 CHECK (timeout_inactividad_min > 0 AND timeout_inactividad_min < 60),
    creada_por UUID NOT NULL,
    creada_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    activa BOOLEAN NOT NULL DEFAULT TRUE
);