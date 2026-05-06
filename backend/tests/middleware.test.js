const request = require('supertest');
const app = require('../app');

describe('Middleware de Autenticación', () => {

  test('Debe rechazar sin Authorization header', async () => {
    const res = await request(app)
      .get('/api/salas');

    expect(res.statusCode).toBe(401);
  });

  test('Debe rechazar token mal formado', async () => {
    const res = await request(app)
      .get('/api/salas')
      .set('Authorization', 'Bearer');

    expect(res.statusCode).toBe(401);
  });

  test('Debe rechazar token inválido', async () => {
    const res = await request(app)
      .get('/api/salas')
      .set('Authorization', 'Bearer token_fake');

    expect(res.statusCode).toBe(401);
  });

});