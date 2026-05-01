// TICKET-004
'use strict';
const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const supabaseAuth = require('../middleware/supabase-auth.middleware');
const router = Router();

router.get('/verify', supabaseAuth, authController.verify);
router.get('/me', supabaseAuth, authController.me);

module.exports = router;
