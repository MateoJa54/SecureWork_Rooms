// TICKET-001, TICKET-002
'use strict';

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check — TICKET-002
app.get('/api/health', async (req, res) => {
  const { pool } = require('./src/config/database');

  const result = {
    status: 'ok',
    uptime: process.uptime(),
    db: 'unknown',
    supabase: 'unknown',
  };
  let statusCode = 200;

  try {
    await pool.query('SELECT 1');
    result.db = 'connected';
  } catch (e) {
    result.db = 'error';
    result.status = 'degraded';
    statusCode = 503;
  }

  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      result.supabase = 'not_configured';
    } else {
      const resp = await fetch(process.env.SUPABASE_URL + '/rest/v1/', {
        headers: { apikey: process.env.SUPABASE_ANON_KEY },
      });
      // Cualquier respuesta <500 indica que Supabase es accesible
      result.supabase = resp.status < 500 ? 'ok' : 'error';
    }
  } catch (e) {
    result.supabase = 'error';
    result.status = 'degraded';
    statusCode = 503;
  }

  res.status(statusCode).json(result);
});

// Rutas de la API
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/salas', require('./src/routes/salas.routes'));
app.use('/api/archivos', require('./src/routes/archivos.routes'));

// Manejo de errores global
app.use(require('./src/middleware/error.middleware'));

module.exports = app;
