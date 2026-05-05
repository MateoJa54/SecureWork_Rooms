// TICKET-005, TICKET-006
'use strict';
const SalasService = require('../services/salas.service');

async function crearSala(req, res, next) {
  try {
    const { nombre, tipo, max_size_mb, timeout_min, pin } = req.body;
    const sala = await SalasService.crearSala({
      nombre,
      tipo,
      max_size_mb: parseInt(max_size_mb) || 10,
      timeout_min: parseInt(timeout_min) || 5,
      pin: pin || undefined,
      creada_por: req.admin.id,
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
    const ip = require('../utils/ip-extractor').extraerIp(req);
    const sesion = await SalasService.unirseSala({ pin, nickname, device_id, fingerprint, ip });
    res.json(sesion);
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