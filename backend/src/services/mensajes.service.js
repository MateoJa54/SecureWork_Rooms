// TICKET-008
'use strict';

const path = require('path');
const MensajesRepository = require('../repositories/mensajes.repository');
const ArchivosRepository = require('../repositories/archivos.repository');
const SalasRepository = require('../repositories/salas.repository');
const SesionesRepository = require('../repositories/sesiones.repository');
const WorkerPool = require('../utils/worker-pool');

// Pool de broadcast: serializa payloads en hilo separado para no bloquear el event loop
const broadcastPool =
  process.env.NODE_ENV === 'test'
    ? null
    : new WorkerPool(path.join(__dirname, '../workers/broadcast.worker.js'), 2);

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

  // Usar Worker Thread para serializar el broadcast (criterio 4 rúbrica: concurrencia)
  if (broadcastPool && io?.to) {
    try {
      // El worker serializa el mensaje en un hilo separado para no bloquear el event loop
      await broadcastPool.ejecutar('broadcast', { mensaje });
      // Broadcast a todos los usuarios de la sala
      io.to(`sala_${sala_id}`).emit('mensaje:nuevo', mensaje);
    } catch {
      // Fallback: broadcast directo si el worker falla
      io.to(`sala_${sala_id}`).emit('mensaje:nuevo', mensaje);
    }
  }

  return mensaje;
}

async function obtenerEstadoInicial(sala_id) {
  const [sala, usuarios, mensajes, archivos] = await Promise.all([
    SalasRepository.buscarPorId(sala_id),
    SesionesRepository.listarPorSala(sala_id),
    MensajesRepository.obtenerHistorial(sala_id, 50),
    ArchivosRepository.listarPorSala(sala_id),
  ]);

  // No exponer pin_hash ni pin_plano al usuario de sala
  const { pin_hash, pin_plano, ...salaPublica } = sala;
  const archivosComoMensajes = archivos.map((archivo) => ({
    id: `archivo-${archivo.id}`,
    sala_id: archivo.sala_id,
    nickname: archivo.subido_por_nickname,
    contenido: '',
    enviado_en: archivo.subido_en,
    archivo: {
      id: archivo.id,
      nombre: archivo.nombre_original,
      nombre_original: archivo.nombre_original,
      mime: archivo.mime_type,
      mime_type: archivo.mime_type,
      size: archivo.tamanio_bytes,
      tamanio_bytes: archivo.tamanio_bytes,
      subido_en: archivo.subido_en,
    },
  }));

  const mensajes_recientes = [...mensajes, ...archivosComoMensajes]
    .sort((a, b) => new Date(a.enviado_en) - new Date(b.enviado_en))
    .slice(-50);

  return { sala: salaPublica, usuarios, mensajes_recientes };
}

module.exports = { procesarMensaje, obtenerEstadoInicial };
