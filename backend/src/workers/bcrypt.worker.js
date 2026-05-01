// TICKET-009 — Worker Thread para operaciones bcrypt (CPU-intensivas)
// Corre en un hilo separado, no bloquea el event loop principal
'use strict';

const { parentPort } = require('worker_threads');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

parentPort.on('message', async ({ id, type, payload }) => {
  try {
    let result;
    if (type === 'hash') {
      result = await bcrypt.hash(payload.plaintext, SALT_ROUNDS);
    } else if (type === 'compare') {
      result = await bcrypt.compare(payload.plaintext, payload.hash);
    } else {
      throw new Error(`Operación desconocida: ${type}`);
    }
    parentPort.postMessage({ id, result });
  } catch (err) {
    parentPort.postMessage({ id, error: err.message });
  }
});
