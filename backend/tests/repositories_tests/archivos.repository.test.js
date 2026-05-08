jest.mock('../../src/config/database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

const { pool } = require('../../src/config/database');

const {
  insertar,
  buscarPorId,
  listarPorSala,
} = require('../../src/repositories/archivos.repository');

describe('Archivos Repository', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // prueba: insertar archivo correctamente
  test('debe insertar archivo correctamente', async () => {
    const archivoMock = {
      id: 1,
      nombre_original: 'test.pdf',
    };

    pool.query.mockResolvedValue({
      rows: [archivoMock],
    });

    const result = await insertar({
      sala_id: 1,
      mensaje_id: 2,
      nombre_original: 'test.pdf',
      ruta_storage: '/uploads/test.pdf',
      mime_type: 'application/pdf',
      tamanio_bytes: 1000,
      subido_por_nickname: 'eduardo',
    });

    expect(pool.query).toHaveBeenCalled();

    expect(result).toEqual(archivoMock);
  });

  // prueba: insertar retorna fallback
  test('debe retornar fallback si no existen rows', async () => {
    pool.query.mockResolvedValue({});

    const result = await insertar({
      sala_id: 1,
      nombre_original: 'archivo.txt',
      ruta_storage: '/tmp/archivo.txt',
      mime_type: 'text/plain',
      tamanio_bytes: 500,
      subido_por_nickname: 'test',
    });

    expect(result).toEqual({
      id: 1,
      nombre_original: 'archivo.txt',
      ruta_storage: '/tmp/archivo.txt',
      mime_type: 'text/plain',
    });
  });

  // prueba: buscar archivo por id correctamente
  test('debe buscar archivo por id correctamente', async () => {
    const archivoMock = {
      id: 5,
      nombre_original: 'doc.pdf',
    };

    pool.query.mockResolvedValue({
      rows: [archivoMock],
    });

    const result = await buscarPorId(5);

    expect(pool.query).toHaveBeenCalledWith(
      'SELECT * FROM archivos WHERE id = $1',
      [5]
    );

    expect(result).toEqual(archivoMock);
  });

  // prueba: buscar archivo retorna null
  test('debe retornar null si archivo no existe', async () => {
    pool.query.mockResolvedValue({
      rows: [],
    });

    const result = await buscarPorId(99);

    expect(result).toBeNull();
  });

  // prueba: listar archivos por sala correctamente
  test('debe listar archivos por sala correctamente', async () => {
    const archivosMock = [
      { id: 1 },
      { id: 2 },
    ];

    pool.query.mockResolvedValue({
      rows: archivosMock,
    });

    const result = await listarPorSala(1);

    expect(pool.query).toHaveBeenCalledWith(
      'SELECT * FROM archivos WHERE sala_id = $1 ORDER BY subido_en DESC',
      [1]
    );

    expect(result).toEqual(archivosMock);
  });

  // prueba: listar archivos retorna array vacío
  test('debe retornar array vacío si no hay archivos', async () => {
    pool.query.mockResolvedValue({});

    const result = await listarPorSala(1);

    expect(result).toEqual([]);
  });

});