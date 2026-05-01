// TICKET-012
'use strict';

const { Router } = require('express');
const archivosController = require('../controllers/archivos.controller');
const sessionAuth = require('../middleware/session.middleware');

const router = Router();

router.get('/:id', sessionAuth, archivosController.descargarArchivo);

module.exports = router;
