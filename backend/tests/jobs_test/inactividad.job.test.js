jest.mock('../../src/services/sesiones.service', () => ({
  limpiarInactivas: jest.fn(),
}));

const SesionesService = require('../../src/services/sesiones.service');

const {
  iniciarJobInactividad,
} = require('../../src/jobs/inactividad.job');

describe('Job Inactividad', () => {

  let io;
  let socketMock;
  let intervaloCallback;

  beforeEach(() => {
    jest.clearAllMocks();

    jest.useFakeTimers();

    socketMock = {
      sesion: {
        session_token: 'token123',
      },

      emit: jest.fn(),

      disconnect: jest.fn(),
    };

    io = {
      to: jest.fn(() => ({
        emit: jest.fn(),
      })),

      in: jest.fn(() => ({
        fetchSockets: jest.fn().mockResolvedValue([
          socketMock,
        ]),
      })),
    };

    jest.spyOn(global, 'setInterval')
      .mockImplementation((callback) => {
        intervaloCallback = callback;
      });

    jest.spyOn(console, 'error')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // prueba: debe iniciar el intervalo
  test('debe iniciar job de inactividad', () => {

    iniciarJobInactividad(io);

    expect(setInterval).toHaveBeenCalledWith(
      expect.any(Function),
      60000
    );
  });

  // prueba: debe expulsar sesiones inactivas
  test('debe expulsar usuarios inactivos', async () => {

    iniciarJobInactividad(io);

    SesionesService.limpiarInactivas.mockResolvedValue([
      {
        sala_id: 1,
        nickname: 'eduardo',
        session_token: 'token123',
      },
    ]);

    await intervaloCallback();

    expect(SesionesService.limpiarInactivas)
      .toHaveBeenCalled();

    expect(io.to)
      .toHaveBeenCalledWith('sala_1');

    expect(socketMock.emit)
      .toHaveBeenCalledWith(
        'sesion:expulsado',
        { motivo: 'inactividad' }
      );

    expect(socketMock.disconnect)
      .toHaveBeenCalled();
  });

  // prueba: no debe expulsar si no hay socket
  test('no debe expulsar si socket no existe', async () => {

    io.in = jest.fn(() => ({
      fetchSockets: jest.fn().mockResolvedValue([]),
    }));

    iniciarJobInactividad(io);

    SesionesService.limpiarInactivas.mockResolvedValue([
      {
        sala_id: 1,
        nickname: 'eduardo',
        session_token: 'token123',
      },
    ]);

    await intervaloCallback();

    expect(SesionesService.limpiarInactivas)
      .toHaveBeenCalled();
  });

  // prueba: debe manejar errores del job
  test('debe manejar errores correctamente', async () => {

    iniciarJobInactividad(io);

    SesionesService.limpiarInactivas
      .mockRejectedValue(new Error('fallo job'));

    await intervaloCallback();

    expect(console.error)
      .toHaveBeenCalledWith(
        '[JobInactividad]',
        'fallo job'
      );
  });

});