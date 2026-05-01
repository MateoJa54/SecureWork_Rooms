import { io } from 'socket.io-client';
import { getDeviceId } from './device.service.js';

let socket = null;

export function conectar(sessionToken) {
  if (socket?.connected) return socket;

  socket = io(import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3000', {
    auth: { session_token: sessionToken, device_id: getDeviceId() },
    transports: ['websocket'],
    reconnectionAttempts: 5,
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function desconectar() {
  socket?.disconnect();
  socket = null;
}
