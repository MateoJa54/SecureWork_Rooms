const request = require('supertest');
const app = require('../app');

describe('Auth / Seguridad', () => {

  test('Debe rechazar crear sala SIN token', async () => {
    const res = await request(app)
      .post('/api/salas')
      .send({
        nombre: "Sala Sin Auth",
        tipo: "texto",
        max_file_size_mb: 5,
        timeout_inactividad_min: 5
      });

    expect(res.statusCode).toBe(401);
  });

  test('Debe rechazar token inválido', async () => {
    const res = await request(app)
      .post('/api/salas')
      .set('Authorization', 'Bearer token_falso')
      .send({
        nombre: "Sala Token Falso",
        tipo: "texto",
        max_file_size_mb: 5,
        timeout_inactividad_min: 5
      });

    expect(res.statusCode).toBe(401);
  });

  test('Debe rechazar header Authorization mal formado', async () => {
    const res = await request(app)
      .post('/api/salas')
      .set('Authorization', 'Token 123456')
      .send({
        nombre: "Sala Header Malo",
        tipo: "texto",
        max_file_size_mb: 5,
        timeout_inactividad_min: 5
      });

    expect(res.statusCode).toBe(401);
  });

  test('Debe rechazar token vacío', async () => {
    const res = await request(app)
      .post('/api/salas')
      .set('Authorization', 'Bearer ')
      .send({
        nombre: "Sala Token Vacio",
        tipo: "texto",
        max_file_size_mb: 5,
        timeout_inactividad_min: 5
      });

    expect(res.statusCode).toBe(401);
  });

  test('Debe rechazar token sin prefijo Bearer', async () => {
    const res = await request(app)
      .post('/api/salas')
      .set('Authorization', '123456')
      .send({
        nombre: "Sala Sin Bearer",
        tipo: "texto",
        max_file_size_mb: 5,
        timeout_inactividad_min: 5
      });

    expect(res.statusCode).toBe(401);
  });

  test('Debe fallar login con credenciales inválidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'fake@test.com',
        password: 'wrongpass'
      });

    expect(res.statusCode).not.toBe(200);
  });

});