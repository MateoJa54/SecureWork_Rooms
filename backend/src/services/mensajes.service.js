// TICKET-008
'use strict';

const MensajesRepository = require('../repositories/mensajes.repository');
const SalasRepository = require('../repositories/salas.repository');
const SesionesRepository = require('../repositories/sesiones.repository');

async function procesarMensaje({ sala_id, nickname, contenido, io }) {
  if (!contenido || contenido.trim().length === 0) {
    const err = new Error('Contenido vacío');
    err.statusCode = 400;
    throw err;
  }
  if (contenido.length > 2000) {
    const err = new Error('Mensaje demasiado largo (máx 2000 chars)');
    err.statusCode = 400;
    throw err;
  }
  const mensaje = await MensajesRepository.insertar({ sala_id, nickname, contenido: contenido.trim() });
  await SesionesRepository.actualizarActividadPorNickname(sala_id, nickname).catch(() => {});
  return mensaje;
}

async function obtenerEstadoInicial(sala_id) {
  const [sala, usuarios, mensajes_recientes] = await Promise.all([
    SalasRepository.buscarPorId(sala_id),
    SesionesRepository.listarPorSala(sala_id),
    MensajesRepository.obtenerHistorial(sala_id, 50),
  ]);

  // No exponer pin_hash ni pin_plano al usuario de sala
  const { pin_hash, pin_plano, ...salaPublica } = sala;

  return { sala: salaPublica, usuarios, mensajes_recientes };
}

module.exports = { procesarMensaje, obtenerEstadoInicial, obtenerHistorial };
