const { parentPort } = require('worker_threads');
const bcrypt = require('bcryptjs');

if (parentPort) {
  parentPort.on('message', async (task) => {
    const { id, operation, data } = task;

    try {
      let result;

      switch (operation) {
        case 'hash':
          result = await bcrypt.hash(data.textoPlano, 10);
          break;

        case 'compare':
          result = await bcrypt.compare(
            data.textoPlano,
            data.hash
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