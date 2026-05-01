// TICKET-006, TICKET-007, TICKET-010
'use strict';

const SesionesRepository = require('../repositories/sesiones.repository');

async function validarSesionSocket(session_token, device_id) {
  const sesion = await SesionesRepository.buscarPorTokenYSala(session_token);
  if (!sesion || sesion.device_id !== device_id) {
    const err = new Error('Sesión inválida');
    err.statusCode = 401;
    throw err;
  }
  return sesion;
}

async function actualizarSocketId(session_token, socket_id) {
  return SesionesRepository.actualizarSocketId(session_token, socket_id);
}

async function actualizarActividad(session_token) {
  return SesionesRepository.actualizarActividad(session_token);
}

async function eliminarSesion(session_token) {
  return SesionesRepository.eliminarPorToken(session_token);
}

async function limpiarInactivas() {
  return SesionesRepository.limpiarInactivas();
}

module.exports = {
  validarSesionSocket,
  actualizarSocketId,
  actualizarActividad,
  eliminarSesion,
  limpiarInactivas,
};
