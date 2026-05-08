jest.mock('jsonwebtoken', () => ({
  decode: jest.fn(),
}));

const jwt = require('jsonwebtoken');

const {
  verificarToken,
} = require('../../src/services/auth.service');

describe('Auth Service', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // prueba: debe verificar token correctamente
  test('debe verificar token correctamente', async () => {

    jwt.decode.mockReturnValue({
      sub: '1',
      email: 'test@test.com',
      role: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 1000,
    });

    const result = await verificarToken(
      'Bearer token123'
    );

    expect(jwt.decode)
      .toHaveBeenCalledWith('token123');

    expect(result).toEqual({
      id: '1',
      email: 'test@test.com',
    });
  });

  // prueba: debe fallar si no hay header
  test('debe fallar si no hay authHeader', async () => {

    await expect(
      verificarToken()
    ).rejects.toThrow('Token no proporcionado');
  });

  // prueba: debe fallar si no inicia con Bearer
  test('debe fallar si token no inicia con Bearer', async () => {

    await expect(
      verificarToken('token123')
    ).rejects.toThrow('Token no proporcionado');
  });

  // prueba: debe fallar si token es malformado
  test('debe fallar si token es malformado', async () => {

    jwt.decode.mockReturnValue(null);

    await expect(
      verificarToken('Bearer token123')
    ).rejects.toThrow('Token malformado');
  });

  // prueba: debe fallar si token expiró
  test('debe fallar si token expiró', async () => {

    jwt.decode.mockReturnValue({
      sub: '1',
      email: 'test@test.com',
      role: 'authenticated',
      exp: Math.floor(Date.now() / 1000) - 1000,
    });

    await expect(
      verificarToken('Bearer token123')
    ).rejects.toThrow('Token expirado');
  });

  // prueba: debe fallar si role no authenticated
  test('debe fallar si role no es authenticated', async () => {

    jwt.decode.mockReturnValue({
      sub: '1',
      email: 'test@test.com',
      role: 'guest',
      exp: Math.floor(Date.now() / 1000) + 1000,
    });

    await expect(
      verificarToken('Bearer token123')
    ).rejects.toThrow('Token no autenticado');
  });

  // prueba: debe asignar statusCode 401
  test('debe asignar statusCode 401', async () => {

    jwt.decode.mockReturnValue(null);

    try {
      await verificarToken('Bearer token123');
    } catch (err) {
      expect(err.statusCode).toBe(401);
    }
  });

  // prueba: debe manejar excepciones internas
  test('debe manejar excepciones internas', async () => {

    jwt.decode.mockImplementation(() => {
      throw new Error('jwt fail');
    });

    await expect(
      verificarToken('Bearer token123')
    ).rejects.toThrow('jwt fail');
  });

});