const { parentPort } = require('worker_threads');

if (parentPort) {
  parentPort.on('message', async (data) => {
    const { id, type, payload } = data;

    try {
      if (type !== 'broadcast') {
        return parentPort.postMessage({
          id,
          error: 'operacion desconocida',
        });
      }

      // Serializa el payload para distribuir a múltiples clientes
      // Esto se ejecuta en un hilo separado para no bloquear el event loop
      const result = JSON.stringify(payload);

      parentPort.postMessage({
        id,
        result,
      });
    } catch (error) {
      parentPort.postMessage({
        id,
        error: error.message,
      });
    }
  });
}