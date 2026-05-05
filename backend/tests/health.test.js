//se validara que el backend este vivo
//que la conexion a la bd sea valida
//que las configuraciones sean validas

const request = require('supertest');

const BASE_URL = 'http://localhost:3000';

describe('Health Check', () => {

  test('GET /api/health debe responder correctamente', async () => {
    const res = await request(BASE_URL).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('db', 'connected');
    expect(res.body).toHaveProperty('supabase', 'ok');
  });

});