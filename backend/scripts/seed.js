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

async function seed() {
  const sql = fs.readFileSync(
    path.join(__dirname, '../seeds/001_admin_inicial.sql'), 
    'utf8'
  );
  
  console.log('Ejecutando seed...');
  await pool.query(sql);
  console.log('✓ Admin creado: usuario=admin, password=admin123');
  await pool.end();
}

seed().catch(err => {
  console.error('Error en seed:', err);
  process.exit(1);
});