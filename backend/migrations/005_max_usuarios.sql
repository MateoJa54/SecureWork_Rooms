-- TICKET: Limite de usuarios por sala
-- Agrega columna max_usuarios a la tabla salas.
-- DEFAULT 50 para que salas existentes no se rompan.
-- CHECK (1..50) segun especificacion: maximo 50 usuarios concurrentes por sala.

ALTER TABLE salas
  ADD COLUMN IF NOT EXISTS max_usuarios INTEGER NOT NULL DEFAULT 50
  CHECK (max_usuarios > 0 AND max_usuarios <= 50);
