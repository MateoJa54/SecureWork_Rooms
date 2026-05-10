#!/bin/sh
set -e

echo "==> Verificando conexion a DB..."
node scripts/sync-db-password.js

echo "==> Ejecutando migraciones..."
node run-migrations.js

echo "==> Iniciando backend..."
exec npm run dev
