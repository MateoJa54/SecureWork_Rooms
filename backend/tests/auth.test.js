//validamos que las rutas protegidas si bloquean acceso sin el token
//validamos seguirdad basica del backend

const request = require('supertest');

const BASE_URL = 'http://localhost:3000';

describe('Auth / Seguridad', () => {

  test('Debe rechazar crear sala SIN token', async () => {
    const res = await request(BASE_URL)
      .post('/api/salas')
      .send({
        nombre: "Sala Sin Auth",
        tipo: "texto",
        max_size_mb: 5,
        timeout_min: 5
      });

    expect(res.statusCode).toBe(401);
  });

  test('Debe rechazar token inválido', async () => {
    const res = await request(BASE_URL)
      .post('/api/salas')
      .set('Authorization', 'Bearer token_falso')
      .send({
        nombre: "Sala Token Falso",
        tipo: "texto",
        max_size_mb: 5,
        timeout_min: 5
      });

    expect(res.statusCode).toBe(401);
  });

});