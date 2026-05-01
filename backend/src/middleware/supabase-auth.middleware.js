// TICKET-004
'use strict';

const AuthService = require('../services/auth.service');

async function supabaseAuth(req, res, next) {
  try {
    const admin = await AuthService.verificarToken(req.headers.authorization);
    req.admin = admin;
    next();
  } catch (err) {
    res.status(err.statusCode || 401).json({ error: err.message });
  }
}

module.exports = supabaseAuth;
