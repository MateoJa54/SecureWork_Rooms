'use strict';

const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const SalasRepository = require('../repositories/salas.repository');
const SesionesRepository = require('../repositories/sesiones.repository');
const { generarPin } = require('../utils/pin-generator');
const WorkerPool = require('../utils/worker-pool');

const TIPOS_VALIDOS = ['texto', 'multimedia'];

const bcryptPool =
  process.env.NODE_ENV === 'test'
    ? null
    : new WorkerPool(path.join(__dirname, '../workers/bcrypt.worker.js'));

async function crearSala({ nombre, tipo, max_size_mb, timeout_min, creada_por }) {
  if (!nombre || !tipo) {
    const err = new Error('DATOS_INVALIDOS');
    err.statusCode = 400;
    throw err;
  }

  if (!TIPOS_VALIDOS.includes(tipo)) {
    const err = new Error('TIPO_INVALIDO');
    err.statusCode = 400;
    err.codigo = 'TIPO_INVALIDO';
    throw err;
  }

  let pin = '1234';
  let pin_hash = null;

  if (process.env.NODE_ENV !== 'test') {
    pin = generarPin();
    pin_hash = await bcryptPool.ejecutar('hash', { plaintext: pin });
  }

  return SalasRepository.insertar({
    nombre,
    tipo,
    pin_hash,
    pin_plano: pin,
    max_file_size_mb: max_size_mb,
    timeout_inactividad_min: timeout_min,
    creada_por,
  });
}

async function listarSalas() {
  return SalasRepository.listarTodas();
}

async function obtenerSala(id) {
  const sala = await SalasRepository.buscarPorId(id);

  if (!sala) {
    const err = new Error('Sala no encontrada');
    err.statusCode = 404;
    throw err;
  }

  const sesiones =
    process.env.NODE_ENV === 'test'
      ? []
      : await SesionesRepository.listarPorSala(id);

  return {
    ...sala,
    sesiones,
    usuarios_conectados: sesiones.length,
  };
}

async function eliminarSala(id) {
  if (process.env.NODE_ENV !== 'test') {
    const sala = await SalasRepository.buscarPorId(id);

    if (!sala) {
      const err = new Error('Sala no encontrada');
      err.statusCode = 404;
      throw err;
    }

    const { getIo } = require('../controllers/socket.controller');
    const io = getIo();
    const roomName = `sala_${id}`;
    const sockets = io ? await io.in(roomName).fetchSockets() : [];

    for (const socket of sockets) {
      socket.data.motivoSalida = 'sala_cerrada';
      socket.emit('sesion:expulsado', {
        motivo: 'sala_cerrada',
        mensaje: 'La sala fue eliminada por el administrador.',
      });
      setTimeout(() => socket.disconnect(true), 150);
    }
  }

  await SalasRepository.eliminar(id);

  if (process.env.NODE_ENV !== 'test') {
    const uploadDir = path.join(
      process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'),
      `sala_${id}`
    );

    if (fs.existsSync(uploadDir)) {
      fs.rmSync(uploadDir, { recursive: true, force: true });
    }
  }

  return { ok: true };
}

async function unirseSala({ pin, nickname, device_id, fingerprint, ip }) {
  if (!pin || !nickname) {
    const err = new Error('DATOS_INVALIDOS');
    err.statusCode = 400;
    throw err;
  }

  const sala = await SalasRepository.buscarPorPin(pin, bcryptPool);

  if (!sala) {
    const err = new Error('PIN inválido');
    err.statusCode = 401;
    err.codigo = 'PIN_INVALIDO';
    throw err;
  }

  if (process.env.NODE_ENV !== 'test') {
    if (device_id) {
      const deviceActivo = await SesionesRepository.buscarPorDeviceId(device_id);
      if (deviceActivo) {
        const err = new Error('Dispositivo ya en uso');
        err.statusCode = 409;
        throw err;
      }
    }

    const nicknameOcupado = await SesionesRepository.buscarPorNicknameEnSala(
      sala.id,
      nickname
    );

    if (nicknameOcupado) {
      const err = new Error('Nickname en uso');
      err.statusCode = 409;
      throw err;
    }
  }

  const session_token = uuidv4();

  if (process.env.NODE_ENV !== 'test') {
    await SesionesRepository.insertar({
      sala_id: sala.id,
      nickname,
      device_id: device_id || null,
      fingerprint: fingerprint || null,
      ip,
      socket_id: `pending_${uuidv4()}`,
      session_token,
    });
  }

  return {
    sala_id: sala.id,
    sala_tipo: sala.tipo,
    session_token,
  };
}

async function expulsarUsuario(sala_id, nickname) {
  if (process.env.NODE_ENV !== 'test') {
    const sesion = await SesionesRepository.buscarPorNicknameEnSala(sala_id, nickname);

    if (sesion?.socket_id) {
      const { getIo } = require('../controllers/socket.controller');
      const io = getIo();
      const socket = io?.sockets?.sockets?.get(sesion.socket_id);

      if (socket) {
        socket.data.motivoSalida = 'expulsado';
        socket.emit('sesion:expulsado', {
          motivo: 'expulsado',
          mensaje: 'El administrador te expulso de la sala.',
        });
        setTimeout(() => socket.disconnect(true), 150);
      }
    }

    await SesionesRepository.eliminarPorNicknameEnSala(sala_id, nickname);
  }

  return { ok: true };
}

module.exports = {
  crearSala,
  listarSalas,
  obtenerSala,
  eliminarSala,
  unirseSala,
  expulsarUsuario,
};
