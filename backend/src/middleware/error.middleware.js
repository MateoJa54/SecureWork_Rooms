'use strict';

// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, next) {
  const statusCode = err.statusCode || inferStatusCode(err);
  const codigo = err.codigo || inferCodigo(err);
  const mensaje = err.message || 'Error interno del servidor';

  if (statusCode === 500) {
    console.error('[ERROR]', err);
  }

  res.status(statusCode).json({ codigo, mensaje });
}

function inferStatusCode(err) {
  if (err.message === 'DATOS_INVALIDOS') return 400;
  if (err.message === 'PIN inválido') return 401;
  if (err.message === 'Sala no encontrada') return 404;
  return 500;
}

function inferCodigo(err) {
  if (err.message === 'DATOS_INVALIDOS') return 'DATOS_INVALIDOS';
  if (err.message === 'PIN inválido') return 'PIN_INVALIDO';
  if (err.message === 'Sala no encontrada') return 'NOT_FOUND';
  return 'ERROR_INTERNO';
}

module.exports = errorMiddleware;