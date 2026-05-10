jest.mock('../../src/repositories/salas.repository', () => ({
  insertar: jest.fn(),
  listarTodas: jest.fn(),
  buscarPorId: jest.fn(),
  buscarPorPin: jest.fn(),
  eliminar: jest.fn(),
}));

jest.mock('../../src/repositories/sesiones.repository', () => ({
  buscarPorDeviceId: jest.fn(),
  buscarPorNicknameEnSala: jest.fn(),
  contarPorSala: jest.fn(),
  insertar: jest.fn(),
  eliminarPorNicknameEnSala: jest.fn(),
}));

jest.mock('../../src/utils/pin-generator', () => ({
  generarPin: jest.fn(() => '1234'),
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'uuid-test'),
}));

const fs = require('fs');

const SalasRepository = require('../../src/repositories/salas.repository');
const SesionesRepository = require('../../src/repositories/sesiones.repository');

const {
  crearSala,
  listarSalas,
  obtenerSala,
  eliminarSala,
  unirseSala,
  expulsarUsuario,
} = require('../../src/services/salas.service');

describe('Salas Service', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test';
  });

  // crear sala correctamente
  test('debe crear sala correctamente', async () => {
    SalasRepository.insertar.mockResolvedValue({
      id: 1,
      nombre: 'Sala Test',
    });

    const result = await crearSala({
      nombre: 'Sala Test',
      tipo: 'publica',
      max_size_mb: 20,
      timeout_min: 10,
      creada_por: 1,
    });

    expect(SalasRepository.insertar).toHaveBeenCalledWith({
      nombre: 'Sala Test',
      tipo: 'publica',
      pin_hash: null,
      pin_plano: '1234',
      max_file_size_mb: 20,
      timeout_inactividad_min: 10,
      max_usuarios: undefined,
      creada_por: 1,
    });

    expect(result.id).toBe(1);
  });

  // datos invalidos
  test('debe fallar si faltan datos', async () => {
    await expect(
      crearSala({
        nombre: '',
        tipo: '',
      })
    ).rejects.toThrow('DATOS_INVALIDOS');
  });

  // tipo invalido
  test('debe fallar si tipo es invalido', async () => {
    await expect(
      crearSala({
        nombre: 'Sala',
        tipo: 'otro',
      })
    ).rejects.toThrow('TIPO_INVALIDO');
  });

  // listar salas
  test('debe listar salas', async () => {
    SalasRepository.listarTodas.mockResolvedValue([
      { id: 1 },
    ]);

    const result = await listarSalas();

    expect(result).toEqual([{ id: 1 }]);
  });

  // obtener sala
  test('debe obtener sala correctamente', async () => {
    SalasRepository.buscarPorId.mockResolvedValue({
      id: 1,
    });

    const result = await obtenerSala(1);

    expect(result.id).toBe(1);
  });

  // sala no encontrada
  test('debe lanzar error si sala no existe', async () => {
    SalasRepository.buscarPorId.mockResolvedValue(null);

    await expect(
      obtenerSala(1)
    ).rejects.toThrow('Sala no encontrada');
  });

  // eliminar sala
  test('debe eliminar sala correctamente', async () => {
    SalasRepository.eliminar.mockResolvedValue({
      id: 1,
    });

    const result = await eliminarSala(1);

    expect(SalasRepository.eliminar).toHaveBeenCalledWith(1);

    expect(result).toEqual({
      ok: true,
    });
  });

  // unirse correctamente
  test('debe unirse correctamente', async () => {
    SalasRepository.buscarPorPin.mockResolvedValue({
      id: 1,
      tipo: 'publica',
    });

    const result = await unirseSala({
      pin: '1234',
      nickname: 'eduardo',
      device_id: 'dev1',
      fingerprint: 'fp1',
      ip: '127.0.0.1',
    });

    expect(SalasRepository.buscarPorPin)
      .toHaveBeenCalledWith('1234', null);

    expect(result.sala_id).toBe(1);
    expect(result.session_token).toBe('uuid-test');
  });

  // datos invalidos unirse
  test('debe fallar si faltan datos para unirse', async () => {
    await expect(
      unirseSala({
        pin: '',
        nickname: '',
      })
    ).rejects.toThrow('DATOS_INVALIDOS');
  });

  // pin invalido
  test('debe fallar con pin invalido', async () => {
    SalasRepository.buscarPorPin.mockResolvedValue(null);

    await expect(
      unirseSala({
        pin: '0000',
        nickname: 'eduardo',
      })
    ).rejects.toThrow('PIN inválido');
  });

  // expulsar usuario
  test('debe expulsar usuario correctamente', async () => {
    const result = await expulsarUsuario(1, 'eduardo');

    expect(result).toEqual({
      ok: true,
    });
  });

  // cubrir rama producción eliminarSala
  test('debe cubrir rama fs en eliminarSala', async () => {
    process.env.NODE_ENV = 'production';

    jest.spyOn(fs, 'existsSync').mockReturnValue(true);

    jest.spyOn(fs, 'rmSync').mockImplementation(() => {});

    SalasRepository.buscarPorId.mockResolvedValue({
      id: 1,
    });

    SalasRepository.eliminar.mockResolvedValue({
      id: 1,
    });

    const result = await eliminarSala(1);

    expect(fs.existsSync).toHaveBeenCalled();

    expect(fs.rmSync).toHaveBeenCalled();

    expect(result.ok).toBe(true);
  });

  // cubrir sala inexistente en producción
  test('debe fallar eliminando sala inexistente en producción', async () => {
    process.env.NODE_ENV = 'production';

    SalasRepository.buscarPorId.mockResolvedValue(null);

    await expect(
      eliminarSala(999)
    ).rejects.toThrow('Sala no encontrada');
  });

  // cubrir ramas producción unirseSala
  test('debe validar device ocupado', async () => {
    process.env.NODE_ENV = 'production';

    SalasRepository.buscarPorPin.mockResolvedValue({
      id: 1,
      tipo: 'publica',
    });

    SesionesRepository.buscarPorDeviceId.mockResolvedValue({
      id: 1,
    });

    await expect(
      unirseSala({
        pin: '1234',
        nickname: 'eduardo',
        device_id: 'dev1',
      })
    ).rejects.toThrow('Dispositivo ya en uso');
  });

  // nickname ocupado
  test('debe validar nickname ocupado', async () => {
    process.env.NODE_ENV = 'production';

    SalasRepository.buscarPorPin.mockResolvedValue({
      id: 1,
      tipo: 'publica',
      max_usuarios: 50,
    });

    SesionesRepository.buscarPorDeviceId.mockResolvedValue(null);

    SesionesRepository.buscarPorNicknameEnSala.mockResolvedValue({
      id: 1,
    });

    await expect(
      unirseSala({
        pin: '1234',
        nickname: 'eduardo',
      })
    ).rejects.toThrow('Nickname en uso');
  });

  // insertar sesion en produccion
  test('debe insertar sesion en produccion', async () => {
    process.env.NODE_ENV = 'production';

    SalasRepository.buscarPorPin.mockResolvedValue({
      id: 1,
      tipo: 'publica',
      max_usuarios: 50,
    });

    SesionesRepository.buscarPorDeviceId.mockResolvedValue(null);

    SesionesRepository.buscarPorNicknameEnSala.mockResolvedValue(null);

    SesionesRepository.contarPorSala.mockResolvedValue(0);

    SesionesRepository.insertar.mockResolvedValue({
      id: 1,
    });

    const result = await unirseSala({
      pin: '1234',
      nickname: 'eduardo',
      device_id: 'dev1',
      fingerprint: 'fp1',
      ip: '127.0.0.1',
    });

    expect(SesionesRepository.insertar).toHaveBeenCalled();

    expect(result.sala_id).toBe(1);
  });

  // sala llena
  test('debe rechazar si sala esta llena', async () => {
    process.env.NODE_ENV = 'production';

    SalasRepository.buscarPorPin.mockResolvedValue({
      id: 1,
      tipo: 'publica',
      max_usuarios: 5,
    });

    SesionesRepository.buscarPorDeviceId.mockResolvedValue(null);

    SesionesRepository.buscarPorNicknameEnSala.mockResolvedValue(null);

    SesionesRepository.contarPorSala.mockResolvedValue(5);

    await expect(
      unirseSala({
        pin: '1234',
        nickname: 'eduardo',
        device_id: 'dev1',
        fingerprint: 'fp1',
        ip: '127.0.0.1',
      })
    ).rejects.toThrow('Sala llena');
  });

  // expulsar usuario en produccion
  test('debe eliminar usuario en produccion', async () => {
    process.env.NODE_ENV = 'production';

    SesionesRepository.eliminarPorNicknameEnSala.mockResolvedValue();

    const result = await expulsarUsuario(1, 'eduardo');

    expect(SesionesRepository.eliminarPorNicknameEnSala)
      .toHaveBeenCalledWith(1, 'eduardo');

    expect(result.ok).toBe(true);
  });

});