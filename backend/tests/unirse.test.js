const request = require('supertest');
const app = require('../app');

//mock DB
jest.mock('../src/config/database', () => ({
  pool: {
    query: jest.fn(),
  },
}));

//mock servicio de salas (para controlar respuesta de unirse)
jest.mock('../src/services/salas.service', () => ({
  unirseSala: jest.fn((data) => {
    if (data.pin === '1234') {
      return Promise.resolve({
        sala_id: 1,
        sala_tipo: 'publica',
        session_token: 'test-token'
      });
    }

    const err = new Error('PIN inválido');
    err.statusCode = 401;
    return Promise.reject(err);
  })
}));

const { pool } = require('../src/config/database');

describe('Unirse a Sala', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  //test 1: unirse correctamente
  test('Debe unirse correctamente', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1 }],
    });

    const res = await request(app)
      .post('/api/salas/unirse')
      .send({
        pin: "1234",
        nickname: "user_test",
        device_id: "dev1",
        fingerprint: "fp1"
      });

    expect([200, 409]).toContain(res.statusCode);
  });

  //test 2: PIN incorrecto
  test('Debe fallar con PIN incorrecto', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [],
    });

    const res = await request(app)
      .post('/api/salas/unirse')
      .send({
        pin: "000000",
        nickname: "test",
        device_id: "dev",
        fingerprint: "fp"
      });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

  //test 3: sin datos
  test('Debe fallar sin datos', async () => {
    const res = await request(app)
      .post('/api/salas/unirse')
      .send({});

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });

});