'use strict';

const { Router } = require('express');
const salasController = require('../controllers/salas.controller');
const supabaseAuth = require('../middleware/supabase-auth.middleware');
const sessionAuth = require('../middleware/session.middleware');
const upload = require('../middleware/upload.middleware');
const archivosController = require('../controllers/archivos.controller');

const router = Router();

// Admin
router.get('/', supabaseAuth, salasController.listarSalas);
router.post('/', supabaseAuth, salasController.crearSala);
router.get('/:id', supabaseAuth, salasController.obtenerSala);
router.delete('/:id', supabaseAuth, salasController.eliminarSala);
router.delete('/:id/usuarios/:nickname', supabaseAuth, salasController.expulsarUsuario);

// Pública
router.post('/unirse', salasController.unirseSala);

router.post(
  '/:id/archivos',
  sessionAuth,
  upload.single('file'),
  archivosController.subirArchivo
);

module.exports = router;