jest.mock('../../src/services/archivos.service', () => ({
  procesarUpload: jest.fn(),
  obtenerStream: jest.fn(),
}));

jest.mock('fs', () => ({
  createReadStream: jest.fn(() => ({
    pipe: jest.fn(),
  })),
}));

const fs = require('fs');

const ArchivosService = require('../../src/services/archivos.service');

const {
  subirArchivo,
  descargarArchivo,
} = require('../../src/controllers/archivos.controller');

describe('Archivos Controller', () => {

  let req;
  let res;
  let next;

  beforeEach(() => {

    req = {
      file: {
        originalname: 'test.txt',
      },

      params: {
        id: 1,
      },

      sesion: {
        nickname: 'eduardo',
      },

      user: {
        nickname: 'usuario_test',
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    };

    next = jest.fn();

    jest.clearAllMocks();
  });

  // prueba: archivo faltante
  test('debe retornar error si no existe archivo', async () => {

    req.file = null;

    await subirArchivo(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      error: 'No se recibió archivo',
    });
  });

  // prueba: upload exitoso
  test('debe subir archivo correctamente', async () => {

    const archivoMock = {
      id: 1,
      nombre: 'archivo.txt',
    };

    ArchivosService.procesarUpload
      .mockResolvedValue(archivoMock);

    await subirArchivo(req, res, next);

    expect(ArchivosService.procesarUpload)
      .toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(201);

    expect(res.json).toHaveBeenCalledWith(archivoMock);
  });

  // prueba: nickname anónimo
  test('debe usar nickname anonimo', async () => {

    req.sesion = null;
    req.user = null;

    ArchivosService.procesarUpload
      .mockResolvedValue({});

    await subirArchivo(req, res, next);

    expect(ArchivosService.procesarUpload)
      .toHaveBeenCalledWith(
        expect.objectContaining({
          nickname: 'anonimo',
        })
      );
  });

  // prueba: error upload
  test('debe manejar errores en upload', async () => {

    ArchivosService.procesarUpload
      .mockRejectedValue(new Error('fallo'));

    await subirArchivo(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  // prueba: descargar archivo
  test('debe descargar archivo correctamente', async () => {

    ArchivosService.obtenerStream
      .mockResolvedValue({
        ruta_storage: './archivo.txt',
        mime_type: 'text/plain',
        nombre_original: 'archivo.txt',
      });

    await descargarArchivo(req, res, next);

    expect(res.setHeader)
      .toHaveBeenCalledWith(
        'Content-Type',
        'text/plain'
      );

    expect(fs.createReadStream)
      .toHaveBeenCalled();
  });

  // prueba: error descarga
  test('debe manejar errores en descarga', async () => {

    ArchivosService.obtenerStream
      .mockRejectedValue(new Error('error descarga'));

    await descargarArchivo(req, res, next);

    expect(next).toHaveBeenCalled();
  });

});