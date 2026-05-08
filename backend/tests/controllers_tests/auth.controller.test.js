jest.mock('../../src/services/auth.service', () => ({
  verificarToken: jest.fn(),
}));

const AuthService = require('../../src/services/auth.service');

const {
  verify,
  me,
} = require('../../src/controllers/auth.controller');

describe('Auth Controller', () => {

  let req;
  let res;
  let next;

  beforeEach(() => {

    req = {
      headers: {
        authorization: 'Bearer token123',
      },

      admin: {
        id: 1,
        email: 'admin@test.com',
      },
    };

    res = {
      json: jest.fn(),
    };

    next = jest.fn();

    jest.clearAllMocks();
  });

  // prueba: verify exitoso
  test('debe verificar token correctamente', async () => {

    const adminMock = {
      id: 1,
      email: 'admin@test.com',
    };

    AuthService.verificarToken
      .mockResolvedValue(adminMock);

    await verify(req, res, next);

    expect(AuthService.verificarToken)
      .toHaveBeenCalledWith('Bearer token123');

    expect(res.json).toHaveBeenCalledWith({
      valid: true,
      admin: adminMock,
    });
  });

  // prueba: verify error
  test('debe manejar errores en verify', async () => {

    AuthService.verificarToken
      .mockRejectedValue(new Error('token inválido'));

    await verify(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  // prueba: me
  test('debe retornar admin autenticado', async () => {

    await me(req, res);

    expect(res.json).toHaveBeenCalledWith(req.admin);
  });

});