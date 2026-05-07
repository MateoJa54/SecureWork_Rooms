const { parentPort } = require('worker_threads');

if (parentPort) {
  parentPort.on('message', async (data) => {
    const { id, operation, payload } = data;

    try {
      if (operation !== 'broadcast') {
        return parentPort.postMessage({
          id,
          error: 'operacion desconocida',
        });
      }

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