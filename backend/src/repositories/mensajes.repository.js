// TICKET-008
'use strict';

const { pool } = require('../config/database');

async function insertar({ sala_id, nickname, contenido }) {
  const { rows } = await pool.query(
    `INSERT INTO mensajes (sala_id, nickname, contenido)
     VALUES ($1, $2, $3) RETURNING *`,
    [sala_id, nickname, contenido]
  );
  return rows[0];
}

async function obtenerHistorial(sala_id, limit = 50) {
  const { rows } = await pool.query(
    `SELECT * FROM mensajes WHERE sala_id = $1
     ORDER BY enviado_en DESC LIMIT $2`,
    [sala_id, limit]
  );
  return rows.reverse();
}

module.exports = { insertar, obtenerHistorial };
