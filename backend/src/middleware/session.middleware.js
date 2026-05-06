'use strict';

const SesionesRepository = require('../repositories/sesiones.repository');

async function sessionAuth(req, res, next) {
  const token = req.headers['x-session-token'];

  //para modo test
  if (process.env.NODE_ENV === 'test') {
    if (!token) {
      return res.status(401).json({ error: 'Session token requerido' });
    }

    //aqui simulo una sesion para pruebas, con un nickname fijo y el id de sala que viene en los params
    req.sesion = {
      nickname: 'test-user',
      sala_id: req.params.id,
    };

    return next();
  }

  //Validación normal en producción
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