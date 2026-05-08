jest.mock('../../src/config/database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

const { pool } = require('../../src/config/database');

const {
  insertar,
  obtenerHistorial,
} = require('../../src/repositories/mensajes.repository');

describe('Mensajes Repository', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // prueba: insertar mensaje correctamente
  test('debe insertar mensaje correctamente', async () => {
    const mensajeMock = {
      id: 1,
      sala_id: 1,
      nickname: 'eduardo',
      contenido: 'hola mundo',
    };

    pool.query.mockResolvedValue({
      rows: [mensajeMock],
    });

    const result = await insertar({
      sala_id: 1,
      nickname: 'eduardo',
      contenido: 'hola mundo',
    });

    expect(pool.query).toHaveBeenCalledWith(
      `INSERT INTO mensajes (sala_id, nickname, contenido)
     VALUES ($1, $2, $3) RETURNING *`,
      [1, 'eduardo', 'hola mundo']
    );

    expect(result).toEqual(mensajeMock);
  });

  // prueba: obtener historial correctamente
  test('debe obtener historial correctamente', async () => {
    const mensajesDB = [
      { id: 3, contenido: 'mensaje 3' },
      { id: 2, contenido: 'mensaje 2' },
      { id: 1, contenido: 'mensaje 1' },
    ];

    pool.query.mockResolvedValue({
      rows: mensajesDB,
    });

    const result = await obtenerHistorial(1);

    expect(pool.query).toHaveBeenCalledWith(
      `SELECT * FROM mensajes WHERE sala_id = $1
     ORDER BY enviado_en DESC LIMIT $2`,
      [1, 50]
    );

    expect(result).toEqual([
      { id: 1, contenido: 'mensaje 1' },
      { id: 2, contenido: 'mensaje 2' },
      { id: 3, contenido: 'mensaje 3' },
    ]);
  });

  // prueba: obtener historial con límite personalizado
  test('debe obtener historial con límite personalizado', async () => {
    pool.query.mockResolvedValue({
      rows: [],
    });

    await obtenerHistorial(2, 10);

    expect(pool.query).toHaveBeenCalledWith(
      `SELECT * FROM mensajes WHERE sala_id = $1
     ORDER BY enviado_en DESC LIMIT $2`,
      [2, 10]
    );
  });

  // prueba: obtener historial vacío
  test('debe retornar historial vacío', async () => {
    pool.query.mockResolvedValue({
      rows: [],
    });

    const result = await obtenerHistorial(1);

    expect(result).toEqual([]);
  });

});