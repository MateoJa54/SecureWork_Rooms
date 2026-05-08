jest.mock('../../src/repositories/archivos.repository', () => ({
  insertar: jest.fn(),
  buscarPorId: jest.fn(),
}));

const ArchivosRepository = require('../../src/repositories/archivos.repository');

const {
  procesarUpload,
  obtenerStream,
} = require('../../src/services/archivos.service');

describe('Archivos Service', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // prueba: debe subir archivo correctamente
  test('debe procesar upload correctamente', async () => {

    ArchivosRepository.insertar.mockResolvedValue({
      id: 1,
      nombre_original: 'archivo.pdf',
      mime_type: 'application/pdf',
      tamanio_bytes: 500,
    });

    const file = {
      originalname: 'archivo.pdf',
      mimetype: 'application/pdf',
      path: '/uploads/archivo.pdf',
      size: 500,
    };

    const result = await procesarUpload({
      file,
      sala_id: 1,
      nickname: 'eduardo',
    });

    expect(ArchivosRepository.insertar).toHaveBeenCalledWith({
      sala_id: 1,
      nombre_original: 'archivo.pdf',
      ruta_storage: '/uploads/archivo.pdf',
      mime_type: 'application/pdf',
      tamanio_bytes: 500,
      subido_por_nickname: 'eduardo',
    });

    expect(result).toEqual({
      id: 1,
      nombre: 'archivo.pdf',
      url: '/api/archivos/1',
      mime: 'application/pdf',
      size: 500,
      nickname: 'eduardo',
    });
  });

  // prueba: debe rechazar tipo inválido
  test('debe rechazar archivo con mimetype inválido', async () => {

    const file = {
      originalname: 'virus.exe',
      mimetype: 'application/exe',
      path: '/uploads/virus.exe',
      size: 100,
    };

    await expect(
      procesarUpload({
        file,
        sala_id: 1,
        nickname: 'eduardo',
      })
    ).rejects.toThrow(
      'Tipo de archivo no permitido: application/exe'
    );
  });

  // prueba: debe asignar statusCode 400
  test('debe asignar statusCode 400 al error', async () => {

    const file = {
      originalname: 'archivo.exe',
      mimetype: 'application/exe',
      path: '/uploads/archivo.exe',
      size: 100,
    };

    try {
      await procesarUpload({
        file,
        sala_id: 1,
        nickname: 'eduardo',
      });
    } catch (err) {
      expect(err.statusCode).toBe(400);
    }
  });

  // prueba: obtener stream correctamente
  test('debe obtener stream correctamente', async () => {

    const archivoMock = {
      id: 1,
      nombre_original: 'archivo.pdf',
    };

    ArchivosRepository.buscarPorId.mockResolvedValue(archivoMock);

    const result = await obtenerStream(1);

    expect(ArchivosRepository.buscarPorId)
      .toHaveBeenCalledWith(1);

    expect(result).toEqual(archivoMock);
  });

  // prueba: debe lanzar error si archivo no existe
  test('debe lanzar error si archivo no existe', async () => {

    ArchivosRepository.buscarPorId.mockResolvedValue(null);

    await expect(
      obtenerStream(999)
    ).rejects.toThrow('Archivo no encontrado');
  });

  // prueba: debe asignar statusCode 404
  test('debe asignar statusCode 404 si archivo no existe', async () => {

    ArchivosRepository.buscarPorId.mockResolvedValue(null);

    try {
      await obtenerStream(999);
    } catch (err) {
      expect(err.statusCode).toBe(404);
    }
  });

});