import { createContext, useState, useCallback } from 'react';
import { conectar, desconectar, getSocket } from '../services/socket.service.js';

export const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [connected, setConnected] = useState(false);

  const connect = useCallback((sessionToken) => {
    const socket = conectar(sessionToken);

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return socket;
  }, []);

  const disconnect = useCallback(() => {
    desconectar();
    setConnected(false);
  }, []);

  return (
    <SocketContext.Provider value={{ socket: getSocket(), connected, connect, disconnect }}>
      {children}
    </SocketContext.Provider>
  );
}
