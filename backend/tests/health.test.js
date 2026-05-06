const request = require('supertest');
const app = require('../app');

//mock básico para evitar fallos de DB
jest.mock('../src/config/database', () => ({
  pool: {
    query: jest.fn().mockResolvedValue(true),
  },
}));

//mock de fetch (Supabase)
global.fetch = jest.fn(() =>
  Promise.resolve({
    status: 200,
  })
);

describe('Health Check', () => {

  //test 1: endpoint health
  test('GET /api/health debe responder correctamente', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('db', 'connected');
    expect(['ok', 'not_configured', 'error']).toContain(res.body.supabase);  
  });

  //test 2: propiedades esperadas
  test('Debe retornar todas las propiedades esperadas', async () => {
    const res = await request(app).get('/api/health');

    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('db');
    expect(res.body).toHaveProperty('supabase');
  });

  //test 3: validar tipos de datos
  test('Debe retornar tipos de datos correctos', async () => {
    const res = await request(app).get('/api/health');

    expect(typeof res.body.status).toBe('string');
    expect(typeof res.body.uptime).toBe('number');
    expect(typeof res.body.db).toBe('string');
    expect(typeof res.body.supabase).toBe('string');
  });

  //test 4: validar tiempo de respuesta
  test('Debe responder en menos de 1 segundo', async () => {
    const start = Date.now();

    const res = await request(app).get('/api/health');

    const duration = Date.now() - start;

    expect(res.statusCode).toBe(200);
    expect(duration).toBeLessThan(1000);
  });

  //test 5: ruta inexistente
  test('Debe retornar 404 en ruta inexistente', async () => {
    const res = await request(app).get('/api/health/fake');

    expect(res.statusCode).toBe(404);
  });

  //test 6: cubrir error de DB 
  test('Debe manejar error de base de datos', async () => {
    const { pool } = require('../src/config/database');

    pool.query.mockImplementationOnce(() => {
      throw new Error('DB error');
    });

    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(503);
    expect(res.body.status).toBe('degraded');
    expect(res.body.db).toBe('error');
  });

  //test 7: cubrir error de supabase
  test('Debe manejar error de Supabase', async () => {
    global.fetch.mockImplementationOnce(() => {
      throw new Error('Supabase error');
    });

    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(503);
    expect(res.body.supabase).toBe('error');
  });

});