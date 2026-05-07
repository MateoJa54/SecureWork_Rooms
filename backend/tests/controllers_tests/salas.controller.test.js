jest.mock('../../src/services/salas.service', () => ({
  crearSala: jest.fn(),
  listarSalas: jest.fn(),
  obtenerSala: jest.fn(),
  eliminarSala: jest.fn(),
  unirseSala: jest.fn(),
  expulsarUsuario: jest.fn(),
}));

jest.mock('../../src/utils/ip-extractor', () => ({
  extraerIp: jest.fn(() => '127.0.0.1'),
}));

const SalasService = require('../../src/services/salas.service');

const {
  crearSala,
  listarSalas,
  obtenerSala,
  eliminarSala,
  unirseSala,
  expulsarUsuario,
} = require('../../src/controllers/salas.controller');

describe('Salas Controller', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('debe crear sala correctamente', async () => {
    const salaMock = { id: 1 };

    SalasService.crearSala.mockResolvedValue(salaMock);

    const req = {
      body: {
        nombre: 'Sala Test',
        tipo: 'publica',
        max_size_mb: '20',
        timeout_min: '15',
      },
      admin: {
        id: 99,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    await crearSala(req, res, next);

    expect(SalasService.crearSala).toHaveBeenCalledWith({
      nombre: 'Sala Test',
      tipo: 'publica',
      max_size_mb: 20,
      timeout_min: 15,
      creada_por: 99,
    });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(salaMock);
  });

  test('debe crear sala usando valores por defecto', async () => {
    SalasService.crearSala.mockResolvedValue({
      ok: true,
    });

    const req = {
      body: {
        nombre: 'Sala',
        tipo: 'privada',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    await crearSala(req, res, next);

    expect(SalasService.crearSala).toHaveBeenCalledWith({
      nombre: 'Sala',
      tipo: 'privada',
      max_size_mb: 10,
      timeout_min: 5,
      creada_por: null,
    });
  });

  test('debe llamar next si crearSala falla', async () => {
    const error = new Error('error crear');

    SalasService.crearSala.mockRejectedValue(error);

    const req = {
      body: {},
    };

    const res = {};

    const next = jest.fn();

    await crearSala(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  test('debe listar salas', async () => {
    const salasMock = [{ id: 1 }];

    SalasService.listarSalas.mockResolvedValue(salasMock);

    const req = {};

    const res = {
      json: jest.fn(),
    };

    const next = jest.fn();

    await listarSalas(req, res, next);

    expect(res.json).toHaveBeenCalledWith(salasMock);
  });

  test('debe llamar next si listar falla', async () => {
    const error = new Error('error listar');

    SalasService.listarSalas.mockRejectedValue(error);

    const req = {};

    const res = {};

    const next = jest.fn();

    await listarSalas(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  test('debe obtener sala correctamente', async () => {
    const salaMock = { id: 1 };

    SalasService.obtenerSala.mockResolvedValue(salaMock);

    const req = {
      params: {
        id: 1,
      },
    };

    const res = {
      json: jest.fn(),
    };

    const next = jest.fn();

    await obtenerSala(req, res, next);

    expect(SalasService.obtenerSala).toHaveBeenCalledWith(1);

    expect(res.json).toHaveBeenCalledWith(salaMock);
  });

  test('debe llamar next si obtener falla', async () => {
    const error = new Error('error obtener');

    SalasService.obtenerSala.mockRejectedValue(error);

    const req = {
      params: {
        id: 1,
      },
    };

    const res = {};

    const next = jest.fn();

    await obtenerSala(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  test('debe eliminar sala correctamente', async () => {
    SalasService.eliminarSala.mockResolvedValue();

    const req = {
      params: {
        id: 1,
      },
    };

    const res = {
      json: jest.fn(),
    };

    const next = jest.fn();

    await eliminarSala(req, res, next);

    expect(SalasService.eliminarSala).toHaveBeenCalledWith(1);

    expect(res.json).toHaveBeenCalledWith({
      ok: true,
    });
  });

  test('debe llamar next si eliminar falla', async () => {
    const error = new Error('error eliminar');

    SalasService.eliminarSala.mockRejectedValue(error);

    const req = {
      params: {
        id: 1,
      },
    };

    const res = {};

    const next = jest.fn();

    await eliminarSala(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  test('debe retornar 400 si faltan datos', async () => {
    const req = {
      body: {},
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    await unirseSala(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      codigo: 'DATOS_INVALIDOS',
      mensaje: 'PIN y nickname son requeridos',
    });
  });

  test('debe unirse correctamente', async () => {
    const sesionMock = {
      token: 'abc',
    };

    SalasService.unirseSala.mockResolvedValue(sesionMock);

    const req = {
      body: {
        pin: '1234',
        nickname: 'eduardo',
        device_id: 'dev1',
        fingerprint: 'fp1',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    await unirseSala(req, res, next);

    expect(SalasService.unirseSala).toHaveBeenCalledWith({
      pin: '1234',
      nickname: 'eduardo',
      device_id: 'dev1',
      fingerprint: 'fp1',
      ip: '127.0.0.1',
    });

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledWith(sesionMock);
  });

  test('debe llamar next si unirse falla', async () => {
    const error = new Error('error unirse');

    SalasService.unirseSala.mockRejectedValue(error);

    const req = {
      body: {
        pin: '1234',
        nickname: 'eduardo',
      },
    };

    const res = {};

    const next = jest.fn();

    await unirseSala(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  test('debe expulsar usuario correctamente', async () => {
    SalasService.expulsarUsuario.mockResolvedValue();

    const req = {
      params: {
        id: 1,
        nickname: 'usuario',
      },
    };

    const res = {
      json: jest.fn(),
    };

    const next = jest.fn();

    await expulsarUsuario(req, res, next);

    expect(SalasService.expulsarUsuario).toHaveBeenCalledWith(
      1,
      'usuario'
    );

    expect(res.json).toHaveBeenCalledWith({
      ok: true,
    });
  });

  test('debe llamar next si expulsar falla', async () => {
    const error = new Error('error expulsar');

    SalasService.expulsarUsuario.mockRejectedValue(error);

    const req = {
      params: {
        id: 1,
        nickname: 'usuario',
      },
    };

    const res = {};

    const next = jest.fn();

    await expulsarUsuario(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

});