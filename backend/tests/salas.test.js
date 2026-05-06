const request = require('supertest');
const app = require('../app');

//mock auth middleware (simula usuario autenticado)
jest.mock('../src/middleware/supabase-auth.middleware', () => (req, res, next) => {
  req.user = { id: 1, email: 'test@test.com' };
  next();
});

//mock DB
jest.mock('../src/config/database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

const { pool } = require('../src/config/database');

describe('Salas API (QA controlado)', () => {
  let salaId = 1;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  //test 1: crear sala correctamente
  test('POST /api/salas → Debe crear una sala', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, pin_plano: '1234' }],
    });

    const res = await request(app)
      .post('/api/salas')
      .send({
        nombre: "Sala Test",
        tipo: "publica",
        max_size_mb: 5,
        timeout_min: 5
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  //test 2: nombre vacío
  test('Debe fallar si nombre está vacío', async () => {
    const res = await request(app)
      .post('/api/salas')
      .send({
        nombre: "",
        tipo: "publica"
      });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  //test 3: tipo inválido
  test('Debe fallar si tipo es inválido', async () => {
    const res = await request(app)
      .post('/api/salas')
      .send({
        nombre: "Sala Test",
        tipo: "invalido"
      });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  //test 4: listar salas
  test('GET /api/salas → Debe listar', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, nombre: 'Sala Test' }],
    });

    const res = await request(app)
      .get('/api/salas');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  //test 5: obtener por ID
  test('GET /api/salas/:id → Debe obtener sala', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1 }],
    });

    const res = await request(app)
      .get('/api/salas/1');

    expect(res.statusCode).toBe(200);
  });

  //test 6: unirse
  test('POST /api/salas/unirse → OK', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1 }],
    });

    const res = await request(app)
      .post('/api/salas/unirse')
      .send({
        pin: "1234",
        nickname: "user_test",
        device_id: "dev",
        fingerprint: "fp"
      });

    expect(res.statusCode).toBe(200);
  });

  //test 7: unirse inválido
  test('Debe fallar sin datos', async () => {
    const res = await request(app)
      .post('/api/salas/unirse')
      .send({});

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  //test 8: eliminar sala
  test('DELETE /api/salas/:id → OK', async () => {
    pool.query.mockResolvedValueOnce({});

    const res = await request(app)
      .delete('/api/salas/1');

    expect(res.statusCode).toBe(200);
  });

});