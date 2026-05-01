// TICKET-005, TICKET-006
'use strict';
const { Router } = require('express');
const salasController = require('../controllers/salas.controller');
const supabaseAuth = require('../middleware/supabase-auth.middleware');
const sessionAuth = require('../middleware/session.middleware');
const upload = require('../middleware/upload.middleware');

const router = Router();

// Rutas admin (requieren JWT Supabase)
router.get('/', supabaseAuth, salasController.listarSalas);
router.post('/', supabaseAuth, salasController.crearSala);
router.get('/:id', supabaseAuth, salasController.obtenerSala);
router.delete('/:id', supabaseAuth, salasController.eliminarSala);
router.delete('/:id/usuarios/:nickname', supabaseAuth, salasController.expulsarUsuario);

// Ruta publica anonima
router.post('/unirse', salasController.unirseSala);

// Subida de archivos (requiere session token de sala)
router.post('/:id/archivos', sessionAuth, upload.single('archivo'), require('../controllers/archivos.controller').subirArchivo);

module.exports = router;