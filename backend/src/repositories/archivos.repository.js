// TICKET-011
'use strict';

const { pool } = require('../config/database');

async function insertar({ sala_id, mensaje_id = null, nombre_original, ruta_storage, mime_type, tamanio_bytes, subido_por_nickname }) {
  const { rows } = await pool.query(
    `INSERT INTO archivos
       (sala_id, mensaje_id, nombre_original, ruta_storage, mime_type, tamanio_bytes, subido_por_nickname)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [sala_id, mensaje_id, nombre_original, ruta_storage, mime_type, tamanio_bytes, subido_por_nickname]
  );
  return rows[0];
}

async function buscarPorId(id) {
  const { rows } = await pool.query('SELECT * FROM archivos WHERE id = $1', [id]);
  return rows[0] || null;
}

async function listarPorSala(sala_id) {
  const { rows } = await pool.query(
    'SELECT * FROM archivos WHERE sala_id = $1 ORDER BY subido_en DESC',
    [sala_id]
  );
  return rows;
}

module.exports = { insertar, buscarPorId, listarPorSala };
