// TICKET-010 — Job que expulsa sesiones inactivas cada 60 segundos
'use strict';

const SesionesService = require('../services/sesiones.service');

function iniciarJobInactividad(io) {
  setInterval(async () => {
    try {
      const expulsados = await SesionesService.limpiarInactivas();
      for (const sesion of expulsados) {
        io.to(`sala_${sesion.sala_id}`).emit('usuario:salio', {
          nickname: sesion.nickname,
          motivo: 'inactividad',
        });
        // Notificar al socket del usuario expulsado si sigue conectado
        const sockets = await io.in(`sala_${sesion.sala_id}`).fetchSockets();
        const socketUsuario = sockets.find((s) => s.sesion?.session_token === sesion.session_token);
        if (socketUsuario) {
          socketUsuario.emit('sesion:expulsado', { motivo: 'inactividad' });
          socketUsuario.disconnect();
        }
      }
    } catch (err) {
      console.error('[JobInactividad]', err.message);
    }
  }, 60_000);
}

module.exports = { iniciarJobInactividad };
