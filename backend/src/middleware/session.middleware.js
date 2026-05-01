// TICKET-006
'use strict';

const SesionesRepository = require('../repositories/sesiones.repository');

async function sessionAuth(req, res, next) {
  const token = req.headers['x-session-token'];
  if (!token) {
    return res.status(401).json({ error: 'Session token requerido' });
  }
  const sesion = await SesionesRepository.buscarPorTokenYSala(token);
  if (!sesion) {
    return res.status(401).json({ error: 'Session token inválido o expirado' });
  }
  req.sesion = sesion;
  next();
}

module.exports = sessionAuth;
