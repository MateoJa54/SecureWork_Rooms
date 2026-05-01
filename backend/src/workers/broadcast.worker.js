// TICKET-009 — Worker Thread para broadcast concurrente
// Procesa la serialización del payload sin bloquear el event loop
// El hilo principal recibe el resultado y hace el emit() de Socket.io
'use strict';

const { parentPort } = require('worker_threads');

parentPort.on('message', async ({ id, type, payload }) => {
  try {
    if (type === 'preparar_broadcast') {
      // Serializa y valida el payload antes de enviarlo por Socket.io
      const serialized = JSON.stringify(payload);
      parentPort.postMessage({ id, result: { serialized, tamanio: serialized.length } });
    } else {
      throw new Error(`Operación desconocida: ${type}`);
    }
  } catch (err) {
    parentPort.postMessage({ id, error: err.message });
  }
});
