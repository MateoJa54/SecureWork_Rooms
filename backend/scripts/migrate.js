require('dotenv').config({ path: 'C:\\Users\\MSI\\Desktop\\SecureWork_Rooms\\.env' });
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');


const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'securework',
  user: process.env.DB_USER || 'securework_user',
  password: process.env.DB_PASSWORD || 'securework_pass123',
});

const migrationsDir = path.join(__dirname, '../migrations');

async function migrate() {
  const files = fs.readdirSync(migrationsDir).sort();
  
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    console.log(`Ejecutando: ${file}`);
    await pool.query(sql);
    console.log(`✓ ${file}`);
  }

  console.log('Migraciones completadas.');
  await pool.end();
}

migrate().catch(err => {
  console.error('Error en migración:', err);
  process.exit(1);
});