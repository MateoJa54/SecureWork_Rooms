// TICKET-001, TICKET-002
'use strict';
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { initSocket } = require('./src/controllers/socket.controller');

const PORT = parseInt(process.env.PORT || '3000');
const HOST = process.env.HOST || '0.0.0.0';

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});

initSocket(io);

httpServer.listen(PORT, HOST, () => {
  console.log(`Backend corriendo en http://${HOST}:${PORT}`);
  console.log(`Health check: http://${HOST}:${PORT}/api/health`);
});