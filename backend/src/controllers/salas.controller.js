// TICKET-005, TICKET-006
'use strict';
const SalasService = require('../services/salas.service');

async function crearSala(req, res, next) {
  try {
    const { nombre, tipo, max_size_mb, timeout_min } = req.body;
    const sala = await SalasService.crearSala({
      nombre,
      tipo,
      max_size_mb: max_size_mb !== undefined ? parseInt(max_size_mb) : 10,
      timeout_min: timeout_min !== undefined ? parseInt(timeout_min) : 5,
      creada_por: req.admin?.id || null,
    });
    res.status(201).json(sala);
  } catch (err) {
    next(err);
  }
}

async function listarSalas(req, res, next) {
  try {
    const salas = await SalasService.listarSalas();
    res.json(salas);
  } catch (err) {
    next(err);
  }
}

async function obtenerSala(req, res, next) {
  try {
    const sala = await SalasService.obtenerSala(req.params.id);
    res.json(sala);
  } catch (err) {
    next(err);
  }
}

async function eliminarSala(req, res, next) {
  try {
    await SalasService.eliminarSala(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

async function unirseSala(req, res, next) {
  try {
    const { pin, nickname, device_id, fingerprint } = req.body;

    if (!pin || !nickname) {
      return res.status(400).json({
        codigo: 'DATOS_INVALIDOS',
        mensaje: 'PIN y nickname son requeridos',
      });
    }

    const ip = require('../utils/ip-extractor').extraerIp(req);

    const sesion = await SalasService.unirseSala({
      pin,
      nickname,
      device_id,
      fingerprint,
      ip,
    });

    return res.status(200).json(sesion);

  } catch (err) {
    next(err); 
  }
}
async function expulsarUsuario(req, res, next) {
  try {
    await SalasService.expulsarUsuario(req.params.id, req.params.nickname);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { crearSala, listarSalas, obtenerSala, eliminarSala, unirseSala, expulsarUsuario };