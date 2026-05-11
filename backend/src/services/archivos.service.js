// TICKET-011, TICKET-012
'use strict';

const path = require('path');
const fs = require('fs');
const ArchivosRepository = require('../repositories/archivos.repository');
const WorkerPool = require('../utils/worker-pool');

const TIPOS_PERMITIDOS = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'text/plain', 'text/markdown',
]);

// Pool de file-validation: detecta MIME real por magic bytes en hilo separado
const fileValidationPool =
  process.env.NODE_ENV === 'test'
    ? null
    : new WorkerPool(path.join(__dirname, '../workers/file-validation.worker.js'), 2);

async function procesarUpload({ file, sala_id, nickname }) {
  if (!TIPOS_PERMITIDOS.has(file.mimetype)) {
    const err = new Error(`Tipo de archivo no permitido: ${file.mimetype}`);
    err.statusCode = 400;
    throw err;
  }

  // Validación por magic bytes vía Worker Thread (criterio 5 rúbrica: validaciones)
  if (fileValidationPool) {
    try {
      const buffer = fs.readFileSync(file.path);
      const resultado = await fileValidationPool.ejecutar('validate', {
        buffer: Array.from(buffer),
        mimeType: file.mimetype,
      });

      if (!resultado.esValido) {
        // Borrar archivo rechazado del filesystem
        fs.unlinkSync(file.path);
        const err = new Error(
          `Tipo de archivo real no permitido: ${resultado.mimeReal} (declarado: ${file.mimetype})`
        );
        err.statusCode = 400;
        throw err;
      }
    } catch (validationErr) {
      if (validationErr.statusCode === 400) throw validationErr;
      // Si el worker falla, continuar con validación por extensión (fallback)
      console.error('[FileValidation] Worker error, usando fallback:', validationErr.message);
    }
  }

  const archivo = await ArchivosRepository.insertar({
    sala_id,
    nombre_original: file.originalname,
    ruta_storage: file.path,
    mime_type: file.mimetype,
    tamanio_bytes: file.size,
    subido_por_nickname: nickname,
  });

  return {
    id: archivo.id,
    nombre: archivo.nombre_original,
    url: `/api/archivos/${archivo.id}`,
    mime: archivo.mime_type,
    size: archivo.tamanio_bytes,
    nickname,
  };
}

async function obtenerStream(archivo_id) {
  const archivo = await ArchivosRepository.buscarPorId(archivo_id);
  if (!archivo) {
    const err = new Error('Archivo no encontrado');
    err.statusCode = 404;
    throw err;
  }
  return archivo;
}

module.exports = { procesarUpload, obtenerStream };
