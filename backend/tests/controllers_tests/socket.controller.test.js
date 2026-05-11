jest.mock('../../src/services/sesiones.service', () => ({
  validarSesionSocket: jest.fn(),
  actualizarSocketId: jest.fn(),
  actualizarActividad: jest.fn(),
  eliminarSesion: jest.fn(),
}));

jest.mock('../../src/services/mensajes.service', () => ({
  obtenerEstadoInicial: jest.fn(),
  procesarMensaje: jest.fn(),
}));

jest.mock('../../src/services/archivos.service', () => ({
  obtenerStream: jest.fn(),
}));

const SesionesService = require('../../src/services/sesiones.service');
const MensajesService = require('../../src/services/mensajes.service');
const ArchivosService = require('../../src/services/archivos.service');

const {
  initSocket,
  getIo,
} = require('../../src/controllers/socket.controller');

describe('Socket Controller', () => {

  let io;
  let socket;
  let middlewares;
  let connectionHandler;
  let handlers;

  beforeEach(() => {
    jest.clearAllMocks();

    handlers = {};
    middlewares = [];

    socket = {
      id: 'socket-1',

      handshake: {
        auth: {
          session_token: 'token123',
          device_id: 'device123',
        },
      },

      sesion: {
        session_token: 'token123',
        nickname: 'eduardo',
        sala_id: 1,
      },

      on: jest.fn((evento, callback) => {
        handlers[evento] = callback;
      }),

      emit: jest.fn(),

      join: jest.fn(),

      disconnect: jest.fn(),

      to: jest.fn(() => ({
        emit: jest.fn(),
      })),
    };

    io = {
      use: jest.fn((fn) => {
        middlewares.push(fn);
      }),

      on: jest.fn((evento, callback) => {
        if (evento === 'connection') {
          connectionHandler = callback;
        }
      }),

      to: jest.fn(() => ({
        emit: jest.fn(),
      })),
    };
  });

  // prueba: debe inicializar socket e io
  test('debe inicializar socket correctamente', () => {
    initSocket(io);

    expect(getIo()).toBe(io);

    expect(io.use).toHaveBeenCalled();

    expect(io.on).toHaveBeenCalledWith(
      'connection',
      expect.any(Function)
    );
  });

  // prueba: debe autenticar socket correctamente
  test('debe autenticar socket correctamente', async () => {
    initSocket(io);

    const sesionMock = {
      id: 1,
      nickname: 'eduardo',
    };

    SesionesService.validarSesionSocket.mockResolvedValue(sesionMock);

    const next = jest.fn();

    await middlewares[0](socket, next);

    expect(SesionesService.validarSesionSocket)
      .toHaveBeenCalledWith(
        'token123',
        'device123'
      );

    expect(socket.sesion).toEqual(sesionMock);

    expect(next).toHaveBeenCalled();
  });

  // prueba: debe fallar autenticación
  test('debe fallar autenticación inválida', async () => {
    initSocket(io);

    SesionesService.validarSesionSocket
      .mockRejectedValue(new Error('fail'));

    const next = jest.fn();

    await middlewares[0](socket, next);

    expect(next).toHaveBeenCalledWith(
      expect.any(Error)
    );
  });

  // prueba: debe unirse correctamente a sala
  test('debe ejecutar sala:join correctamente', async () => {
    initSocket(io);

    connectionHandler(socket);

    MensajesService.obtenerEstadoInicial.mockResolvedValue({
      sala: { id: 1 },
      usuarios: [],
      mensajes_recientes: [],
    });

    await handlers['sala:join']({
      sala_id: 1,
    });

    expect(SesionesService.actualizarSocketId)
      .toHaveBeenCalledWith(
        'token123',
        'socket-1'
      );

    expect(socket.join)
      .toHaveBeenCalledWith('sala_1');

    expect(socket.emit)
      .toHaveBeenCalledWith(
        'sala:joined',
        expect.any(Object)
      );
  });

  // prueba: debe manejar error en sala:join
  test('debe manejar error en sala:join', async () => {
    initSocket(io);

    connectionHandler(socket);

    SesionesService.actualizarSocketId
      .mockRejectedValue(new Error('join fail'));

    await handlers['sala:join']({
      sala_id: 1,
    });

    expect(socket.emit)
      .toHaveBeenCalledWith(
        'error',
        {
          codigo: 'JOIN_FALLIDO',
          mensaje: 'join fail',
        }
      );
  });

  // prueba: debe enviar mensaje correctamente
  test('debe enviar mensaje correctamente', async () => {
    initSocket(io);

    connectionHandler(socket);

    const mensajeMock = {
      id: 1,
      contenido: 'hola',
    };

    MensajesService.procesarMensaje
      .mockResolvedValue(mensajeMock);

    await handlers['mensaje:enviar']({
      contenido: 'hola',
    });

    expect(MensajesService.procesarMensaje)
      .toHaveBeenCalled();
  });

  // prueba: debe manejar error al enviar mensaje
  test('debe manejar error en mensaje:enviar', async () => {
    initSocket(io);

    connectionHandler(socket);

    MensajesService.procesarMensaje
      .mockRejectedValue(new Error('mensaje fail'));

    await handlers['mensaje:enviar']({
      contenido: 'hola',
    });

    expect(socket.emit)
      .toHaveBeenCalledWith(
        'error',
        {
          codigo: 'MENSAJE_FALLIDO',
          mensaje: 'mensaje fail',
        }
      );
  });

  // prueba: debe emitir typing
  test('debe emitir usuario escribiendo', async () => {
    initSocket(io);

    connectionHandler(socket);

    await handlers['mensaje:typing']();

    expect(socket.to)
      .toHaveBeenCalledWith('sala_1');
  });

  // prueba: debe notificar archivo correctamente
  test('debe notificar archivo correctamente', async () => {
    initSocket(io);

    connectionHandler(socket);

    ArchivosService.obtenerStream.mockResolvedValue({
      id: 1,
    });

    await handlers['archivo:notificar']({
      archivo_id: 1,
    });

    expect(ArchivosService.obtenerStream)
      .toHaveBeenCalledWith(1);

    expect(io.to)
      .toHaveBeenCalledWith('sala_1');
  });

  // prueba: debe manejar error archivo:notificar
  test('debe manejar error en archivo:notificar', async () => {
    initSocket(io);

    connectionHandler(socket);

    ArchivosService.obtenerStream
      .mockRejectedValue(new Error('archivo fail'));

    await handlers['archivo:notificar']({
      archivo_id: 1,
    });

    expect(socket.emit)
      .toHaveBeenCalledWith(
        'error',
        {
          codigo: 'ARCHIVO_FALLIDO',
          mensaje: 'archivo fail',
        }
      );
  });

  // prueba: debe actualizar actividad
  test('debe actualizar actividad correctamente', async () => {
    initSocket(io);

    connectionHandler(socket);

    SesionesService.actualizarActividad
      .mockResolvedValue();

    await handlers['actividad:ping']();

    expect(SesionesService.actualizarActividad)
      .toHaveBeenCalledWith('token123');
  });

  // prueba: debe ignorar error en actividad
  test('debe ignorar error en actividad', async () => {
    initSocket(io);

    connectionHandler(socket);

    SesionesService.actualizarActividad
      .mockRejectedValue(new Error('ping fail'));

    await handlers['actividad:ping']();

    expect(SesionesService.actualizarActividad)
      .toHaveBeenCalled();
  });

  // prueba: debe salir de sala correctamente
  test('debe salir de sala correctamente', async () => {
    initSocket(io);

    connectionHandler(socket);

    SesionesService.eliminarSesion
      .mockResolvedValue();

    await handlers['sala:salir']();

    expect(SesionesService.eliminarSesion)
      .toHaveBeenCalledWith('token123');

    expect(socket.disconnect)
      .toHaveBeenCalled();
  });

  // prueba: debe manejar disconnect
  test('debe manejar disconnect correctamente', async () => {
    initSocket(io);

    connectionHandler(socket);

    SesionesService.eliminarSesion
      .mockResolvedValue();

    await handlers['disconnect']();

    expect(SesionesService.eliminarSesion)
      .toHaveBeenCalledWith('token123');

    expect(socket.to)
      .toHaveBeenCalledWith('sala_1');
  });

});