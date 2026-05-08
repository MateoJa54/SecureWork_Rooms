const { parentPort } = require('worker_threads');
const { fileTypeFromBuffer } = require('file-type');

const MIME_TYPES_PERMITIDOS = [
  'image/png',
  'image/jpeg',
  'application/pdf',
  'text/plain',
];

if (parentPort) {
  parentPort.on('message', async (task) => {
    const { id, operation, data } = task;

    try {
      switch (operation) {

        case 'validate': {
          const tipoDetectado =
            await fileTypeFromBuffer(data.buffer);

          const mimeReal = tipoDetectado
            ? tipoDetectado.mime
            : 'text/plain';

          const esValido =
            MIME_TYPES_PERMITIDOS.includes(mimeReal);

          parentPort.postMessage({
            id,
            result: {
              esValido,
              mimeDeclared: data.mimeType,
              mimeReal,
            },
          });

          break;
        }

        default:
          throw new Error('operacion desconocida');
      }

    } catch (error) {

      parentPort.postMessage({
        id,
        error: error.message,
      });

    }
  });
}