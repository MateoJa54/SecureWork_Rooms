// TICKET-005
'use strict';

const { pool } = require('../config/database');

async function insertar({ nombre, tipo, pin_hash, pin_plano, max_file_size_mb, timeout_inactividad_min, creada_por }) {
  const { rows } = await pool.query(
    `INSERT INTO salas (nombre, tipo, pin_hash, pin_plano, max_file_size_mb, timeout_inactividad_min, creada_por)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [nombre, tipo, pin_hash, pin_plano, max_file_size_mb, timeout_inactividad_min, creada_por]
  );
  return rows[0];
}

async function listarTodas() {
  const { rows } = await pool.query(
    `SELECT s.*, COUNT(sa.id)::int AS usuarios_conectados
     FROM salas s
     LEFT JOIN sesiones_activas sa ON sa.sala_id = s.id
     WHERE s.activa = true
     GROUP BY s.id
     ORDER BY s.creada_en DESC`
  );
  return rows;
}

async function buscarPorId(id) {
  const { rows } = await pool.query(
    `SELECT s.*, COUNT(sa.id)::int AS usuarios_conectados
     FROM salas s
     LEFT JOIN sesiones_activas sa ON sa.sala_id = s.id
     WHERE s.id = $1
     GROUP BY s.id`,
    [id]
  );
  return rows[0] || null;
}

async function buscarPorPin(pin, bcryptPool) {
  const { rows } = await pool.query('SELECT * FROM salas WHERE activa = true');
  for (const sala of rows) {
    const match = await bcryptPool.ejecutar('compare', { plaintext: pin, hash: sala.pin_hash });
    if (match) return sala;
  }
  return null;
}

async function eliminar(id) {
  await pool.query('DELETE FROM salas WHERE id = $1', [id]);
}

module.exports = { insertar, listarTodas, buscarPorId, buscarPorPin, eliminar };
