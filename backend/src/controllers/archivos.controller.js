'use strict';

const path = require('path');
const fs = require('fs');
const ArchivosService = require('../services/archivos.service');

async function subirArchivo(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No se recibió archivo',
      });
    }

    const nickname =
      req.sesion?.nickname ||
      req.user?.nickname ||
      'anonimo';

    const archivo = await ArchivosService.procesarUpload({
      file: req.file,
      sala_id: req.params.id,
      nickname,
    });

    return res.status(201).json(archivo);

  } catch (err) {
    next(err);
  }
}

async function descargarArchivo(req, res, next) {
  try {
    const archivo = await ArchivosService.obtenerStream(req.params.id);

    const filePath = path.resolve(archivo.ruta_storage);

    res.setHeader('Content-Type', archivo.mime_type);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${archivo.nombre_original}"`
    );

    fs.createReadStream(filePath).pipe(res);

  } catch (err) {
    next(err);
  }
}

module.exports = {
  subirArchivo,
  descargarArchivo,
};