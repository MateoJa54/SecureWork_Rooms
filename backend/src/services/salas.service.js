// TICKET-005, TICKET-006, TICKET-009
'use strict';

const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const SalasRepository = require('../repositories/salas.repository');
const SesionesRepository = require('../repositories/sesiones.repository');
const { generarPin } = require('../utils/pin-generator');
const WorkerPool = require('../utils/worker-pool');

const bcryptPool = new WorkerPool(path.join(__dirname, '../workers/bcrypt.worker.js'));

async function crearSala({ nombre, tipo, max_size_mb, timeout_min, creada_por }) {
  const pin = generarPin();
  const pin_hash = await bcryptPool.ejecutar('hash', { plaintext: pin });
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
  return SalasRepository.buscarPorId(id);
}

async function eliminarSala(id) {
  const sala = await SalasRepository.buscarPorId(id);
  if (!sala) {
    const err = new Error('Sala no encontrada');
    err.statusCode = 404;
    throw err;
  }
  await SalasRepository.eliminar(id);
  // Limpiar directorio de uploads de la sala
  const uploadDir = path.join(
    process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'),
    `sala_${id}`
  );
  if (fs.existsSync(uploadDir)) {
    fs.rmSync(uploadDir, { recursive: true, force: true });
  }
}

async function unirseSala({ pin, nickname, device_id, fingerprint, ip }) {
  const sala = await SalasRepository.buscarPorPin(pin, bcryptPool);
  if (!sala) {
    const err = new Error('PIN inválido');
    err.statusCode = 401;
    err.codigo = 'PIN_INVALIDO';
    throw err;
  }

  const deviceActivo = await SesionesRepository.buscarPorDeviceId(device_id);
  if (deviceActivo) {
    const err = new Error('Dispositivo ya tiene una sesión activa en otra sala');
    err.statusCode = 409;
    err.codigo = 'DEVICE_EN_OTRA_SALA';
    throw err;
  }

  const nicknameOcupado = await SesionesRepository.buscarPorNicknameEnSala(sala.id, nickname);
  if (nicknameOcupado) {
    const err = new Error('Nickname ya está en uso en esta sala');
    err.statusCode = 409;
    err.codigo = 'NICKNAME_DUPLICADO';
    throw err;
  }

  const session_token = uuidv4();
  await SesionesRepository.insertar({
    sala_id: sala.id,
    nickname,
    device_id,
    fingerprint,
    ip,
    socket_id: `pending_${uuidv4()}`,
    session_token,
  });

  return { sala_id: sala.id, sala_tipo: sala.tipo, session_token };
}

async function expulsarUsuario(sala_id, nickname) {
  await SesionesRepository.eliminarPorNicknameEnSala(sala_id, nickname);
}

module.exports = { crearSala, listarSalas, obtenerSala, eliminarSala, unirseSala, expulsarUsuario };
