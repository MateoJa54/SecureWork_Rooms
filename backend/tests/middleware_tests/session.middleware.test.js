jest.mock('../../src/repositories/sesiones.repository', () => ({
  buscarPorTokenYSala: jest.fn(),
}));

const SesionesRepository = require('../../src/repositories/sesiones.repository');

const sessionAuth = require('../../src/middleware/session.middleware');

describe('Session Middleware', () => {

  let req;
  let res;
  let next;

  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.clearAllMocks();

    process.env = { ...OLD_ENV };

    req = {
      headers: {},
      params: {
        id: 1,
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  // prueba: debe fallar en modo test sin token
  test('debe retornar 401 en modo test sin token', async () => {
    process.env.NODE_ENV = 'test';

    await sessionAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      error: 'Session token requerido',
    });
  });

  // prueba: debe crear sesión mock en modo test
  test('debe crear sesión mock en modo test', async () => {
    process.env.NODE_ENV = 'test';

    req.headers['x-session-token'] = 'token123';

    await sessionAuth(req, res, next);

    expect(req.sesion).toEqual({
      nickname: 'test-user',
      sala_id: 1,
    });

    expect(next).toHaveBeenCalled();
  });

  // prueba: debe fallar en producción sin token
  test('debe retornar 401 en producción sin token', async () => {
    process.env.NODE_ENV = 'production';

    await sessionAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      error: 'Session token requerido',
    });
  });

  // prueba: debe fallar con sesión inválida
  test('debe retornar 401 si sesión no existe', async () => {
    process.env.NODE_ENV = 'production';

    req.headers['x-session-token'] = 'token123';

    SesionesRepository.buscarPorTokenYSala
      .mockResolvedValue(null);

    await sessionAuth(req, res, next);

    expect(SesionesRepository.buscarPorTokenYSala)
      .toHaveBeenCalledWith('token123');

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      error: 'Session token inválido o expirado',
    });
  });

  // prueba: debe autenticar correctamente en producción
  test('debe autenticar correctamente en producción', async () => {
    process.env.NODE_ENV = 'production';

    req.headers['x-session-token'] = 'token123';

    const sesionMock = {
      nickname: 'eduardo',
      sala_id: 5,
    };

    SesionesRepository.buscarPorTokenYSala
      .mockResolvedValue(sesionMock);

    await sessionAuth(req, res, next);

    expect(req.sesion).toEqual(sesionMock);

    expect(next).toHaveBeenCalled();
  });

});