jest.mock('../../src/repositories/sesiones.repository', () => ({
  buscarPorTokenYSala: jest.fn(),
  actualizarSocketId: jest.fn(),
  actualizarActividad: jest.fn(),
  eliminarPorToken: jest.fn(),
  limpiarInactivas: jest.fn(),
}));

const SesionesRepository = require('../../src/repositories/sesiones.repository');

const {
  validarSesionSocket,
  actualizarSocketId,
  actualizarActividad,
  eliminarSesion,
  limpiarInactivas,
} = require('../../src/services/sesiones.service');

describe('Sesiones Service', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // validar sesión correctamente
  test('debe validar sesion correctamente', async () => {
    const sesionMock = {
      session_token: 'token123',
      device_id: 'device123',
      nickname: 'eduardo',
    };

    SesionesRepository.buscarPorTokenYSala
      .mockResolvedValue(sesionMock);

    const result = await validarSesionSocket(
      'token123',
      'device123'
    );

    expect(
      SesionesRepository.buscarPorTokenYSala
    ).toHaveBeenCalledWith('token123');

    expect(result).toEqual(sesionMock);
  });

  // sesión inexistente
  test('debe fallar si sesion no existe', async () => {
    SesionesRepository.buscarPorTokenYSala
      .mockResolvedValue(null);

    await expect(
      validarSesionSocket(
        'token123',
        'device123'
      )
    ).rejects.toThrow('Sesión inválida');
  });

  // device incorrecto
  test('debe fallar si device_id no coincide', async () => {
    SesionesRepository.buscarPorTokenYSala
      .mockResolvedValue({
        device_id: 'otro-device',
      });

    await expect(
      validarSesionSocket(
        'token123',
        'device123'
      )
    ).rejects.toThrow('Sesión inválida');
  });

  // actualizar socket
  test('debe actualizar socket id', async () => {
    SesionesRepository.actualizarSocketId
      .mockResolvedValue();

    await actualizarSocketId(
      'token123',
      'socket123'
    );

    expect(
      SesionesRepository.actualizarSocketId
    ).toHaveBeenCalledWith(
      'token123',
      'socket123'
    );
  });

  // actualizar actividad
  test('debe actualizar actividad', async () => {
    SesionesRepository.actualizarActividad
      .mockResolvedValue();

    await actualizarActividad('token123');

    expect(
      SesionesRepository.actualizarActividad
    ).toHaveBeenCalledWith('token123');
  });

  // eliminar sesión
  test('debe eliminar sesion', async () => {
    SesionesRepository.eliminarPorToken
      .mockResolvedValue();

    await eliminarSesion('token123');

    expect(
      SesionesRepository.eliminarPorToken
    ).toHaveBeenCalledWith('token123');
  });

  // limpiar inactivas
  test('debe limpiar sesiones inactivas', async () => {
    const sesiones = [
      { session_token: 'abc' },
    ];

    SesionesRepository.limpiarInactivas
      .mockResolvedValue(sesiones);

    const result = await limpiarInactivas();

    expect(
      SesionesRepository.limpiarInactivas
    ).toHaveBeenCalled();

    expect(result).toEqual(sesiones);
  });

});