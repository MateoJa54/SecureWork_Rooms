'use strict';

const { Pool } = require('pg');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'securework',
  user: process.env.DB_USER || 'securework_user',
};

const password = process.env.DB_PASSWORD || '';

async function sync() {
  // Intento 1: conectar con la contraseña configurada
  const pool = new Pool({ ...config, password });
  try {
    await pool.query('SELECT 1');
    console.log('    DB conectada OK');
    await pool.end();
    return;
  } catch {
    await pool.end();
  }

  console.error('    ERROR: No se pudo conectar a la DB.');
  console.error('    Ejecuta manualmente:');
  console.error(`    docker compose exec postgres psql -U ${config.user} -d ${config.database} -c "ALTER USER ${config.user} WITH PASSWORD '${password}';"`);
  console.error('    Luego reinicia: docker compose restart backend');
  process.exit(1);
}

sync();
