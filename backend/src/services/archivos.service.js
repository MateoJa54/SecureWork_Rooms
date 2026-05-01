// TICKET-011, TICKET-012
'use strict';

const path = require('path');
const ArchivosRepository = require('../repositories/archivos.repository');

const TIPOS_PERMITIDOS = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'text/plain', 'text/markdown',
]);

async function procesarUpload({ file, sala_id, nickname }) {
  if (!TIPOS_PERMITIDOS.has(file.mimetype)) {
    const err = new Error(`Tipo de archivo no permitido: ${file.mimetype}`);
    err.statusCode = 400;
    throw err;
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
