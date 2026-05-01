// TICKET-009 — Worker Thread para validación de magic bytes de archivos
// Evita que un .exe renombrado a .jpg pase la validación de extensión
'use strict';

const { parentPort } = require('worker_threads');
const fileType = require('file-type');

const MIME_PERMITIDOS = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'text/plain',
]);

parentPort.on('message', async ({ id, type, payload }) => {
  try {
    if (type === 'validar') {
      const buffer = Buffer.from(payload.buffer);
      const detected = await fileType.fromBuffer(buffer);
      const mimeReal = detected ? detected.mime : 'text/plain';
      const esValido = MIME_PERMITIDOS.has(mimeReal);
      parentPort.postMessage({ id, result: { esValido, mimeReal, mimeDeclared: payload.declaredMime } });
    } else {
      throw new Error(`Operación desconocida: ${type}`);
    }
  } catch (err) {
    parentPort.postMessage({ id, error: err.message });
  }
});
