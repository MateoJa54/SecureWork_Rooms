// TICKET-006, TICKET-007, TICKET-010
'use strict';

const { pool } = require('../config/database');

async function insertar({ sala_id, nickname, device_id, fingerprint, ip, socket_id, session_token }) {
  const { rows } = await pool.query(
    `INSERT INTO sesiones_activas
       (sala_id, nickname, device_id, fingerprint, ip, socket_id, session_token)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [sala_id, nickname, device_id, fingerprint, ip, socket_id, session_token]
  );
  return rows[0];
}

async function buscarPorDeviceId(device_id) {
  const { rows } = await pool.query(
    'SELECT * FROM sesiones_activas WHERE device_id = $1',
    [device_id]
  );
  return rows[0] || null;
}

async function buscarPorNicknameEnSala(sala_id, nickname) {
  const { rows } = await pool.query(
    'SELECT * FROM sesiones_activas WHERE sala_id = $1 AND nickname = $2',
    [sala_id, nickname]
  );
  return rows[0] || null;
}

async function buscarPorTokenYSala(session_token) {
  const { rows } = await pool.query(
    'SELECT * FROM sesiones_activas WHERE session_token = $1',
    [session_token]
  );
  return rows[0] || null;
}

async function listarPorSala(sala_id) {
  const { rows } = await pool.query(
    'SELECT nickname, conectado_en FROM sesiones_activas WHERE sala_id = $1',
    [sala_id]
  );
  return rows;
}

async function contarPorSala(sala_id) {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS total FROM sesiones_activas WHERE sala_id = $1',
    [sala_id]
  );
  return rows[0]?.total ?? 0;
}

async function actualizarSocketId(session_token, socket_id) {
  await pool.query(
    'UPDATE sesiones_activas SET socket_id = $1 WHERE session_token = $2',
    [socket_id, session_token]
  );
}

async function actualizarActividad(session_token) {
  await pool.query(
    'UPDATE sesiones_activas SET ultima_actividad = NOW() WHERE session_token = $1',
    [session_token]
  );
}

async function actualizarActividadPorNickname(sala_id, nickname) {
  await pool.query(
    'UPDATE sesiones_activas SET ultima_actividad = NOW() WHERE sala_id = $1 AND nickname = $2',
    [sala_id, nickname]
  );
}

async function eliminarPorToken(session_token) {
  await pool.query('DELETE FROM sesiones_activas WHERE session_token = $1', [session_token]);
}

async function eliminarPorNicknameEnSala(sala_id, nickname) {
  await pool.query(
    'DELETE FROM sesiones_activas WHERE sala_id = $1 AND nickname = $2',
    [sala_id, nickname]
  );
}

async function eliminarPorSocketId(socket_id) {
  await pool.query('DELETE FROM sesiones_activas WHERE socket_id = $1', [socket_id]);
}

async function limpiarInactivas() {
  const { rows: salas } = await pool.query('SELECT id, timeout_inactividad_min FROM salas WHERE activa = true');
  const resultados = [];
  for (const sala of salas) {
    const { rows } = await pool.query(
      `DELETE FROM sesiones_activas
       WHERE sala_id = $1
         AND ultima_actividad < NOW() - ($2 || ' minutes')::interval
       RETURNING session_token, nickname`,
      [sala.id, sala.timeout_inactividad_min]
    );
    resultados.push(...rows);
  }
  return resultados;
}

module.exports = {
  insertar, buscarPorDeviceId, buscarPorNicknameEnSala, buscarPorTokenYSala,
  listarPorSala, contarPorSala, actualizarSocketId, actualizarActividad, actualizarActividadPorNickname,
  eliminarPorToken, eliminarPorNicknameEnSala, eliminarPorSocketId, limpiarInactivas,
};
