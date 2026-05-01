// TICKET-004
'use strict';
const jwt = require('jsonwebtoken');

async function verificarToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Token no proporcionado');
    err.statusCode = 401;
    throw err;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.decode(token);

    if (!payload) throw new Error('Token malformado');
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      const err = new Error('Token expirado');
      err.statusCode = 401;
      throw err;
    }
    if (payload.role !== 'authenticated') {
      const err = new Error('Token no autenticado');
      err.statusCode = 401;
      throw err;
    }

    return { id: payload.sub, email: payload.email };
  } catch (e) {
    const err = new Error(e.message || 'Token inválido o expirado');
    err.statusCode = 401;
    throw err;
  }
}

module.exports = { verificarToken };