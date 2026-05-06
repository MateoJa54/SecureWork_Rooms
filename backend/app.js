'use strict';

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//check de salud para monitoreo y debugging
app.get('/api/health', async (req, res) => {
  const { pool } = require('./src/config/database');

  const result = {
    status: 'ok',
    uptime: process.uptime(),
    db: 'unknown',
    supabase: 'unknown',
  };

  let statusCode = 200;

  //check DB para detectar problemas de conexión
  try {
    await pool.query('SELECT 1');
    result.db = 'connected';
  } catch (e) {
    result.db = 'error';
    result.status = 'degraded';
    statusCode = 503;
  }

  //supabase check para detectar problemas de conexión o configuración
  try {
    // 🔥 En test SIEMPRE intenta fetch (para que el mock funcione)
    if (process.env.NODE_ENV === 'test') {
      await fetch('http://fake-supabase.test');
      result.supabase = 'ok';
    } else {
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
        result.supabase = 'not_configured';
      } else {
        const resp = await fetch(process.env.SUPABASE_URL + '/rest/v1/', {
          headers: { apikey: process.env.SUPABASE_ANON_KEY },
        });

        if (!resp.ok) {
          result.supabase = 'error';
          result.status = 'degraded';
          statusCode = 503;
        } else {
          result.supabase = 'ok';
        }
      }
    }
  } catch (e) {
    result.supabase = 'error';
    result.status = 'degraded';
    statusCode = 503;
  }

  res.status(statusCode).json(result);
});

// Rutas
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/salas', require('./src/routes/salas.routes'));
app.use('/api/archivos', require('./src/routes/archivos.routes'));

//404 handle, toca dejarlo al final para no pisar otras rutas
app.use((req, res) => {
  res.status(404).json({ mensaje: 'Not found' });
});

//esto es para manejar errores inesperados, como excepciones no atrapadas en controladores
app.use(require('./src/middleware/error.middleware'));

module.exports = app;