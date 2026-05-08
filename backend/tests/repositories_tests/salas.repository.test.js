jest.mock('../../src/config/database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

const { pool } = require('../../src/config/database');

const {
  insertar,
  listarTodas,
  buscarPorId,
  buscarPorPin,
  eliminar,
} = require('../../src/repositories/salas.repository');

describe('Salas Repository', () => {

  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  // INSERTAR

  test('debe lanzar error si faltan datos', async () => {
    await expect(
      insertar({})
    ).rejects.toMatchObject({
      message: 'DATOS_INVALIDOS',
      statusCode: 400,
      codigo: 'DATOS_INVALIDOS',
    });
  });

  test('debe retornar mock en modo test', async () => {
    process.env.NODE_ENV = 'test';

    const result = await insertar({
      nombre: 'Sala Test',
      tipo: 'publica',
      pin_plano: '1234',
    });

    expect(result).toEqual({
      id: 1,
      nombre: 'Sala Test',
      tipo: 'publica',
      pin_plano: '1234',
      activa: true,
    });
  });

  test('debe insertar sala correctamente', async () => {
    process.env.NODE_ENV = 'development';

    const salaMock = {
      id: 1,
      nombre: 'Sala',
    };

    pool.query.mockResolvedValue({
      rows: [salaMock],
    });

    const result = await insertar({
      nombre: 'Sala',
      tipo: 'privada',
      pin_hash: 'hash123',
      pin_plano: '1234',
      max_file_size_mb: 20,
      timeout_inactividad_min: 15,
      creada_por: 99,
    });

    expect(pool.query).toHaveBeenCalled();

    expect(result).toEqual(salaMock);
  });

  test('debe manejar error DB al insertar', async () => {
    process.env.NODE_ENV = 'development';

    pool.query.mockRejectedValue(new Error('DB FAIL'));

    await expect(
      insertar({
        nombre: 'Sala',
        tipo: 'publica',
      })
    ).rejects.toMatchObject({
      message: 'DB_ERROR_INSERT_SALA',
      statusCode: 500,
      codigo: 'DB_ERROR_INSERT_SALA',
    });
  });

  // LISTAR

  test('debe retornar array vacío en modo test', async () => {
    process.env.NODE_ENV = 'test';

    const result = await listarTodas();

    expect(result).toEqual([]);
  });

  test('debe listar salas correctamente', async () => {
    process.env.NODE_ENV = 'development';

    const salasMock = [
      { id: 1 },
      { id: 2 },
    ];

    pool.query.mockResolvedValue({
      rows: salasMock,
    });

    const result = await listarTodas();

    expect(result).toEqual(salasMock);
  });

  test('debe retornar array vacío si listar falla', async () => {
    process.env.NODE_ENV = 'development';

    pool.query.mockRejectedValue(new Error('FAIL'));

    const result = await listarTodas();

    expect(result).toEqual([]);
  });

  // BUSCAR POR ID

  test('debe retornar null si id no existe', async () => {
    const result = await buscarPorId(null);

    expect(result).toBeNull();
  });

  test('debe retornar mock en modo test al buscar por id', async () => {
    process.env.NODE_ENV = 'test';

    const result = await buscarPorId(1);

    expect(result).toEqual({
      id: 1,
      nombre: 'Sala Test',
      tipo: 'publica',
      activa: true,
    });
  });

  test('debe buscar sala por id correctamente', async () => {
    process.env.NODE_ENV = 'development';

    const salaMock = {
      id: 1,
      nombre: 'Sala Real',
    };

    pool.query.mockResolvedValue({
      rows: [salaMock],
    });

    const result = await buscarPorId(1);

    expect(pool.query).toHaveBeenCalledWith(
      `SELECT * FROM salas WHERE id = $1`,
      [1]
    );

    expect(result).toEqual(salaMock);
  });

  test('debe retornar null si ocurre error en buscarPorId', async () => {
    process.env.NODE_ENV = 'development';

    pool.query.mockRejectedValue(new Error('FAIL'));

    const result = await buscarPorId(1);

    expect(result).toBeNull();
  });

  // BUSCAR POR PIN

  test('debe retornar sala mock en modo test', async () => {
    process.env.NODE_ENV = 'test';

    const result = await buscarPorPin('1234');

    expect(result).toEqual({
      id: 1,
      tipo: 'publica',
      activa: true,
    });
  });

  test('debe retornar null en modo test si pin incorrecto', async () => {
    process.env.NODE_ENV = 'test';

    const result = await buscarPorPin('0000');

    expect(result).toBeNull();
  });

  test('debe buscar sala por pin correctamente', async () => {
    process.env.NODE_ENV = 'development';

    const bcryptPool = {
      ejecutar: jest.fn().mockResolvedValue(true),
    };

    pool.query.mockResolvedValue({
      rows: [
        {
          id: 1,
          pin_hash: 'hash123',
        },
      ],
    });

    const result = await buscarPorPin('1234', bcryptPool);

    expect(pool.query).toHaveBeenCalledWith(
      'SELECT * FROM salas WHERE activa = true AND pin_hash IS NOT NULL'
    );

    expect(bcryptPool.ejecutar).toHaveBeenCalled();

    expect(result).toEqual({
      id: 1,
      pin_hash: 'hash123',
    });
  });

  test('debe retornar null si ningún pin coincide', async () => {
    process.env.NODE_ENV = 'development';

    const bcryptPool = {
      ejecutar: jest.fn().mockResolvedValue(false),
    };

    pool.query.mockResolvedValue({
      rows: [
        {
          id: 1,
          pin_hash: 'hash123',
        },
      ],
    });

    const result = await buscarPorPin('0000', bcryptPool);

    expect(result).toBeNull();
  });

  // ELIMINAR

  test('debe retornar null si id es inválido', async () => {
    const result = await eliminar(null);

    expect(result).toBeNull();
  });

  test('debe retornar mock en modo test al eliminar', async () => {
    process.env.NODE_ENV = 'test';

    const result = await eliminar(1);

    expect(result).toEqual({
      id: 1,
    });
  });

  test('debe eliminar sala correctamente', async () => {
    process.env.NODE_ENV = 'development';

    pool.query.mockResolvedValue({
      rows: [{ id: 1 }],
    });

    const result = await eliminar(1);

    expect(pool.query).toHaveBeenCalledWith(
      'DELETE FROM salas WHERE id = $1 RETURNING id',
      [1]
    );

    expect(result).toEqual({
      id: 1,
    });
  });

  test('debe manejar error DB al eliminar', async () => {
    process.env.NODE_ENV = 'development';

    pool.query.mockRejectedValue(new Error('FAIL'));

    await expect(
      eliminar(1)
    ).rejects.toMatchObject({
      message: 'DB_ERROR_DELETE_SALA',
      statusCode: 500,
      codigo: 'DB_ERROR_DELETE_SALA',
    });
  });

});