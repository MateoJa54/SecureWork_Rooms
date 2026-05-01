// TICKET-004
'use strict';

const AuthService = require('../services/auth.service');

async function verify(req, res, next) {
  try {
    const admin = await AuthService.verificarToken(req.headers.authorization);
    res.json({ valid: true, admin });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  res.json(req.admin);
}

module.exports = { verify, me };
