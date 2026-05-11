const { parentPort } = require('worker_threads');
const { fileTypeFromBuffer } = require('file-type');

const MIME_TYPES_PERMITIDOS = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/markdown',
];

if (parentPort) {
  parentPort.on('message', async (task) => {
    const { id, type, payload } = task;

    try {
      switch (type) {

        case 'validate': {
          const buffer = Buffer.from(payload.buffer);
          const tipoDetectado = await fileTypeFromBuffer(buffer);

          const mimeReal = tipoDetectado
            ? tipoDetectado.mime
            : 'text/plain';

          const esValido =
            MIME_TYPES_PERMITIDOS.includes(mimeReal);

          parentPort.postMessage({
            id,
            result: {
              esValido,
              mimeDeclared: payload.mimeType,
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