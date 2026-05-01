// TICKET-001
'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000'),
  HOST: process.env.HOST || '0.0.0.0',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '5432'),
  DB_NAME: process.env.DB_NAME || 'securework',
  DB_USER: process.env.DB_USER || 'securework_user',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET || '',
  SESSION_TOKEN_SECRET: process.env.SESSION_TOKEN_SECRET || '',
  SESSION_TOKEN_EXPIRES_MIN: parseInt(process.env.SESSION_TOKEN_EXPIRES_MIN || '15'),
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'),
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '10'),
};
