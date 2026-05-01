// TICKET-001
'use strict';

// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const codigo = err.codigo || 'ERROR_INTERNO';
  const mensaje = err.message || 'Error interno del servidor';

  if (statusCode === 500) {
    console.error('[ERROR]', err);
  }

  res.status(statusCode).json({ codigo, mensaje });
}

module.exports = errorMiddleware;
