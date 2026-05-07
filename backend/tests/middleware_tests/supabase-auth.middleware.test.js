jest.mock('../../src/services/auth.service', () => ({
  verificarToken: jest.fn(),
}));

const AuthService = require('../../src/services/auth.service');

const supabaseAuth = require('../../src/middleware/supabase-auth.middleware');

describe('Supabase Auth Middleware', () => {

  let req;
  let res;
  let next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      headers: {
        authorization: 'Bearer token123',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  // prueba: debe autenticar correctamente
  test('debe autenticar correctamente', async () => {
    const adminMock = {
      id: 1,
      email: 'admin@test.com',
    };

    AuthService.verificarToken
      .mockResolvedValue(adminMock);

    await supabaseAuth(req, res, next);

    expect(AuthService.verificarToken)
      .toHaveBeenCalledWith('Bearer token123');

    expect(req.admin).toEqual(adminMock);

    expect(next).toHaveBeenCalled();
  });

  // prueba: debe manejar error de autenticación
  test('debe manejar error de autenticación', async () => {
    const error = {
      statusCode: 403,
      message: 'Token inválido',
    };

    AuthService.verificarToken
      .mockRejectedValue(error);

    await supabaseAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);

    expect(res.json).toHaveBeenCalledWith({
      error: 'Token inválido',
    });
  });

  // prueba: debe usar 401 por defecto
  test('debe usar 401 por defecto si no existe statusCode', async () => {
    const error = {
      message: 'Unauthorized',
    };

    AuthService.verificarToken
      .mockRejectedValue(error);

    await supabaseAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      error: 'Unauthorized',
    });
  });

});