// TICKET-007, TICKET-008
'use strict';
const SesionesService = require('../services/sesiones.service');
const MensajesService = require('../services/mensajes.service');

let _io = null;

function getIo() {
  return _io;
}

function initSocket(io) {
  _io = io;

  io.use(async (socket, next) => {
    const { session_token, device_id } = socket.handshake.auth;
    try {
      const sesion = await SesionesService.validarSesionSocket(session_token, device_id);
      socket.sesion = sesion;
      next();
    } catch (err) {
      next(new Error('AUTENTICACION_INVALIDA'));
    }
  });

  io.on('connection', (socket) => {
    const { sesion } = socket;
    let salidaNotificada = false;

    function notificarSalida(motivo) {
      if (salidaNotificada) return;
      salidaNotificada = true;
      socket.to(`sala_${sesion.sala_id}`).emit('usuario:salio', {
        nickname: sesion.nickname,
        motivo,
      });
    }

    socket.on('sala:join', async ({ sala_id }) => {
      try {
        await SesionesService.actualizarSocketId(sesion.session_token, socket.id);
        socket.join(`sala_${sala_id}`);
        const { sala, usuarios, mensajes_recientes } =
          await MensajesService.obtenerEstadoInicial(sala_id);
        socket.emit('sala:joined', { sala, usuarios, mensajes_recientes });
        socket.to(`sala_${sala_id}`).emit('usuario:entro', { nickname: sesion.nickname });
      } catch (err) {
        socket.emit('error', { codigo: 'JOIN_FALLIDO', mensaje: err.message });
      }
    });

    socket.on('mensaje:enviar', async ({ contenido }) => {
      try {
        if (socket.data?.motivoSalida) {
          socket.emit('sesion:expulsado', { motivo: socket.data.motivoSalida });
          return;
        }

        const mensaje = await MensajesService.procesarMensaje({
          sala_id: sesion.sala_id,
          nickname: sesion.nickname,
          contenido,
          io,
        });
        // El broadcast se hace dentro de procesarMensaje vía Worker Thread.
        // Solo si no hay io (tests), emitimos aquí como fallback.
        if (!io) {
          socket.emit('mensaje:nuevo', mensaje);
        }
      } catch (err) {
        socket.emit('error', { codigo: 'MENSAJE_FALLIDO', mensaje: err.message });
      }
    });

    socket.on('mensaje:typing', () => {
      if (socket.data?.motivoSalida) return;
      socket.to(`sala_${sesion.sala_id}`).emit('usuario:escribiendo', { nickname: sesion.nickname });
    });

    socket.on('archivo:notificar', async ({ archivo_id }) => {
      try {
        if (socket.data?.motivoSalida) {
          socket.emit('sesion:expulsado', { motivo: socket.data.motivoSalida });
          return;
        }

        const ArchivosService = require('../services/archivos.service');
        const archivo = await ArchivosService.obtenerStream(archivo_id);
        io.to(`sala_${sesion.sala_id}`).emit('archivo:nuevo', archivo);
      } catch (err) {
        socket.emit('error', { codigo: 'ARCHIVO_FALLIDO', mensaje: err.message });
      }
    });

    socket.on('actividad:ping', async () => {
      await SesionesService.actualizarActividad(sesion.session_token).catch(() => {});
    });

    socket.on('sala:salir', async () => {
      await SesionesService.eliminarSesion(sesion.session_token).catch(() => {});
      notificarSalida('voluntario');
      socket.disconnect();
    });

    socket.on('disconnect', async () => {
      await SesionesService.eliminarSesion(sesion.session_token).catch(() => {});
      notificarSalida(socket.data?.motivoSalida || 'desconexion');
    });
  });
}

module.exports = { initSocket, getIo };
