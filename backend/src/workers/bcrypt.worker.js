const { parentPort } = require('worker_threads');
const bcrypt = require('bcrypt');

if (parentPort) {
  parentPort.on('message', async (task) => {
    const { id, type, payload } = task;

    try {
      let result;

      switch (type) {
        case 'hash':
          result = await bcrypt.hash(payload.plaintext, 10);
          break;

        case 'compare':
          result = await bcrypt.compare(
            payload.plaintext,
            payload.hash
          );
          break;

        default:
          throw new Error('operacion desconocida');
      }

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
