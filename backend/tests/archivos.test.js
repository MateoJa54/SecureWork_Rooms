const request = require('supertest');
const app = require('../app');

//mock auth (simula usuario logueado)
jest.mock('../src/middleware/supabase-auth.middleware', () => (req, res, next) => {
  req.user = { id: 1, email: 'test@test.com' };
  next();
});;

//mock DB
jest.mock('../src/config/database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

const { pool } = require('../src/config/database');

describe('Archivos', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  //test 1: sin token (quitamos mock temporalmente)
  test('Debe rechazar subida sin sesión/token', async () => {
    jest.resetModules();

    const appNoAuth = require('../app');

    const res = await request(appNoAuth)
      .post('/api/salas/1/archivos');

    expect(res.statusCode).toBe(401);
  });

  //test 2: sin archivo
  test('Debe fallar si no se envía archivo', async () => {
    const res = await request(app)
      .post('/api/salas/1/archivos');

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  //test 3: flujo exitoso simulado
  test('Debe aceptar subida simulada', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{}] });

    const res = await request(app)
      .post('/api/salas/1/archivos')
      .set('x-session-token', 'fake-token') // 👈 AGREGAR ESTO
      .attach('file', Buffer.from('test'), 'test.txt');

    expect([200, 201]).toContain(res.statusCode);
  });

});