'use strict';

const { Router } = require('express');
const archivosController = require('../controllers/archivos.controller');
const sessionAuth = require('../middleware/session.middleware');
const upload = require('../middleware/upload.middleware');

const router = Router();

router.post(
  '/:id/archivos',
  sessionAuth,
  upload.single('file'),
  archivosController.subirArchivo
);

router.get('/:id', sessionAuth, archivosController.descargarArchivo);

module.exports = router;