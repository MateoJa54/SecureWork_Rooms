const request = require('supertest');
const { getToken } = require('./utils/authHelper');

const BASE_URL = 'http://localhost:3000';

describe('Salas', () => {
  let TOKEN;

  beforeAll(async () => {
    TOKEN = await getToken();
  });

  //test 1: crear sala 
  test('Debe crear una sala correctamente', async () => {
    const nombre = `Sala QA ${Date.now()}`;

    const res = await request(BASE_URL)
      .post('/api/salas')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({
        nombre,
        tipo: "texto",
        max_file_size_mb: 5,
        timeout_inactividad_min: 5
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('pin_plano');
  });

  //test dos: nombre vacio
  test('Debe fallar si el nombre está vacío', async () => {
    const res = await request(BASE_URL)
      .post('/api/salas')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({
        nombre: "",
        tipo: "texto",
        max_file_size_mb: 5,
        timeout_inactividad_min: 5
      });

    expect(res.statusCode).not.toBe(201);
  });

  //test 3: tipo invalido
  test('Debe fallar si el tipo es inválido', async () => {
    const nombre = `Sala QA ${Date.now()}`;

    const res = await request(BASE_URL)
      .post('/api/salas')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({
        nombre,
        tipo: "invalido",
        max_file_size_mb: 5,
        timeout_inactividad_min: 5
      });

    expect(res.statusCode).not.toBe(201);
  });

  //test 4: datos incompletos
  test('Debe fallar si faltan campos', async () => {
    const res = await request(BASE_URL)
      .post('/api/salas')
      .set('Authorization', `Bearer ${TOKEN}`)
      .send({
        nombre: `Sala QA ${Date.now()}`
      });

    expect(res.statusCode).not.toBe(201);
  });

});