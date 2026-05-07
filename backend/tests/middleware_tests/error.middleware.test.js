const errorMiddleware = require('../../src/middleware/error.middleware');

describe('Error Middleware', () => {

  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {};

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // prueba: usar statusCode personalizado
  test('debe usar statusCode personalizado', () => {
    const err = {
      statusCode: 401,
      codigo: 'TOKEN_INVALIDO',
      message: 'Token inválido',
    };

    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      codigo: 'TOKEN_INVALIDO',
      mensaje: 'Token inválido',
    });
  });

  // prueba: inferir DATOS_INVALIDOS
  test('debe inferir DATOS_INVALIDOS', () => {
    const err = {
      message: 'DATOS_INVALIDOS',
    };

    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      codigo: 'DATOS_INVALIDOS',
      mensaje: 'DATOS_INVALIDOS',
    });
  });

  // prueba: inferir PIN inválido
  test('debe inferir PIN inválido', () => {
    const err = {
      message: 'PIN inválido',
    };

    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      codigo: 'PIN_INVALIDO',
      mensaje: 'PIN inválido',
    });
  });

  // prueba: inferir Sala no encontrada
  test('debe inferir Sala no encontrada', () => {
    const err = {
      message: 'Sala no encontrada',
    };

    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);

    expect(res.json).toHaveBeenCalledWith({
      codigo: 'NOT_FOUND',
      mensaje: 'Sala no encontrada',
    });
  });

  // prueba: error interno por defecto
  test('debe manejar error interno', () => {
    const err = {
      message: 'Error desconocido',
    };

    errorMiddleware(err, req, res, next);

    expect(console.error).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      codigo: 'ERROR_INTERNO',
      mensaje: 'Error desconocido',
    });
  });

  // prueba: mensaje por defecto
  test('debe usar mensaje por defecto', () => {
    const err = {};

    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      codigo: 'ERROR_INTERNO',
      mensaje: 'Error interno del servidor',
    });
  });

});