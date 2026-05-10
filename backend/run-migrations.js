// TICKET-001
// Runner de migraciones SQL. Ejecutar con: node run-migrations.js
// Funciona en Windows y Linux gracias a path.join()
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env'), override: false });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'securework',
  user: process.env.DB_USER || 'securework_user',
  password: process.env.DB_PASSWORD || 'changeme',
});

const migrationsDir = path.join(__dirname, 'migrations');

async function migrate() {
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`Ejecutando: ${file}`);
    await pool.query(sql);
    console.log(`✓ ${file}`);
  }

  console.log('Migraciones completadas.');
  await pool.end();
}

migrate().catch((err) => {
  console.error('Error en migración:', err.message);
  pool.end();
  process.exit(1);
});
