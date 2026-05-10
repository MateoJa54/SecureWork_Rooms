import { useContext } from 'react';
import { SocketContext } from '../context/socket-context.js';

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket debe usarse dentro de <SocketProvider>');
  return ctx;
}
