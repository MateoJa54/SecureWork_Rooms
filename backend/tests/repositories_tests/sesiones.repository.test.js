jest.mock('../../src/config/database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

const { pool } = require('../../src/config/database');

const {
  insertar,
  buscarPorDeviceId,
  buscarPorNicknameEnSala,
  buscarPorTokenYSala,
  listarPorSala,
  contarPorSala,
  actualizarSocketId,
  actualizarActividad,
  actualizarActividadPorNickname,
  eliminarPorToken,
  eliminarPorNicknameEnSala,
  eliminarPorSocketId,
  limpiarInactivas,
} = require('../../src/repositories/sesiones.repository');

describe('Sesiones Repository', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // INSERTAR

  test('debe insertar sesión correctamente', async () => {
    const sesionMock = {
      id: 1,
      nickname: 'eduardo',
    };

    pool.query.mockResolvedValue({
      rows: [sesionMock],
    });

    const result = await insertar({
      sala_id: 1,
      nickname: 'eduardo',
      device_id: 'dev1',
      fingerprint: 'fp1',
      ip: '127.0.0.1',
      socket_id: 'socket1',
      session_token: 'token123',
    });

    expect(pool.query).toHaveBeenCalled();

    expect(result).toEqual(sesionMock);
  });

  // BUSCAR POR DEVICE ID

  test('debe buscar por device_id correctamente', async () => {
    const sesionMock = {
      id: 1,
    };

    pool.query.mockResolvedValue({
      rows: [sesionMock],
    });

    const result = await buscarPorDeviceId('dev1');

    expect(pool.query).toHaveBeenCalledWith(
      'SELECT * FROM sesiones_activas WHERE device_id = $1',
      ['dev1']
    );

    expect(result).toEqual(sesionMock);
  });

  test('debe retornar null si device_id no existe', async () => {
    pool.query.mockResolvedValue({
      rows: [],
    });

    const result = await buscarPorDeviceId('none');

    expect(result).toBeNull();
  });

  // BUSCAR POR NICKNAME EN SALA

  test('debe buscar por nickname en sala', async () => {
    const sesionMock = {
      nickname: 'eduardo',
    };

    pool.query.mockResolvedValue({
      rows: [sesionMock],
    });

    const result = await buscarPorNicknameEnSala(1, 'eduardo');

    expect(pool.query).toHaveBeenCalledWith(
      'SELECT * FROM sesiones_activas WHERE sala_id = $1 AND nickname = $2',
      [1, 'eduardo']
    );

    expect(result).toEqual(sesionMock);
  });

  test('debe retornar null si nickname no existe', async () => {
    pool.query.mockResolvedValue({
      rows: [],
    });

    const result = await buscarPorNicknameEnSala(1, 'none');

    expect(result).toBeNull();
  });

  // BUSCAR POR TOKEN

  test('debe buscar por token correctamente', async () => {
    const sesionMock = {
      session_token: 'abc',
    };

    pool.query.mockResolvedValue({
      rows: [sesionMock],
    });

    const result = await buscarPorTokenYSala('abc');

    expect(pool.query).toHaveBeenCalledWith(
      'SELECT * FROM sesiones_activas WHERE session_token = $1',
      ['abc']
    );

    expect(result).toEqual(sesionMock);
  });

  test('debe retornar null si token no existe', async () => {
    pool.query.mockResolvedValue({
      rows: [],
    });

    const result = await buscarPorTokenYSala('none');

    expect(result).toBeNull();
  });

  // LISTAR POR SALA

  test('debe listar sesiones por sala', async () => {
    const sesionesMock = [
      { nickname: 'user1' },
      { nickname: 'user2' },
    ];

    pool.query.mockResolvedValue({
      rows: sesionesMock,
    });

    const result = await listarPorSala(1);

    expect(pool.query).toHaveBeenCalledWith(
      'SELECT nickname, conectado_en FROM sesiones_activas WHERE sala_id = $1',
      [1]
    );

    expect(result).toEqual(sesionesMock);
  });

  // CONTAR POR SALA

  test('debe contar sesiones por sala', async () => {
    pool.query.mockResolvedValue({
      rows: [{ total: 7 }],
    });

    const result = await contarPorSala('sala-uuid-1');

    expect(pool.query).toHaveBeenCalledWith(
      'SELECT COUNT(*)::int AS total FROM sesiones_activas WHERE sala_id = $1',
      ['sala-uuid-1']
    );

    expect(result).toBe(7);
  });

  test('debe retornar 0 si no hay sesiones', async () => {
    pool.query.mockResolvedValue({
      rows: [{ total: 0 }],
    });

    const result = await contarPorSala('sala-vacia');

    expect(result).toBe(0);
  });

  // ACTUALIZAR SOCKET ID

  test('debe actualizar socket id', async () => {
    pool.query.mockResolvedValue({});

    await actualizarSocketId('token123', 'socket123');

    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE sesiones_activas SET socket_id = $1 WHERE session_token = $2',
      ['socket123', 'token123']
    );
  });

  // ACTUALIZAR ACTIVIDAD

  test('debe actualizar actividad', async () => {
    pool.query.mockResolvedValue({});

    await actualizarActividad('token123');

    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE sesiones_activas SET ultima_actividad = NOW() WHERE session_token = $1',
      ['token123']
    );
  });

  test('debe actualizar actividad por nickname', async () => {
    pool.query.mockResolvedValue({});

    await actualizarActividadPorNickname(1, 'eduardo');

    expect(pool.query).toHaveBeenCalledWith(
      'UPDATE sesiones_activas SET ultima_actividad = NOW() WHERE sala_id = $1 AND nickname = $2',
      [1, 'eduardo']
    );
  });

  // ELIMINAR

  test('debe eliminar por token', async () => {
    pool.query.mockResolvedValue({});

    await eliminarPorToken('token123');

    expect(pool.query).toHaveBeenCalledWith(
      'DELETE FROM sesiones_activas WHERE session_token = $1',
      ['token123']
    );
  });

  test('debe eliminar por nickname en sala', async () => {
    pool.query.mockResolvedValue({});

    await eliminarPorNicknameEnSala(1, 'eduardo');

    expect(pool.query).toHaveBeenCalledWith(
      'DELETE FROM sesiones_activas WHERE sala_id = $1 AND nickname = $2',
      [1, 'eduardo']
    );
  });

  test('debe eliminar por socket id', async () => {
    pool.query.mockResolvedValue({});

    await eliminarPorSocketId('socket123');

    expect(pool.query).toHaveBeenCalledWith(
      'DELETE FROM sesiones_activas WHERE socket_id = $1',
      ['socket123']
    );
  });

  // LIMPIAR INACTIVAS

  test('debe limpiar sesiones inactivas', async () => {

    pool.query
      .mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            timeout_inactividad_min: 5,
          },
        ],
      })

      .mockResolvedValueOnce({
        rows: [
          {
            session_token: 'abc',
            nickname: 'eduardo',
          },
        ],
      });

    const result = await limpiarInactivas();

    expect(pool.query).toHaveBeenCalledTimes(2);

    expect(result).toEqual([
      {
        session_token: 'abc',
        nickname: 'eduardo',
      },
    ]);
  });

  test('debe retornar array vacío si no hay inactivas', async () => {

    pool.query.mockResolvedValueOnce({
      rows: [],
    });

    const result = await limpiarInactivas();

    expect(result).toEqual([]);
  });

});