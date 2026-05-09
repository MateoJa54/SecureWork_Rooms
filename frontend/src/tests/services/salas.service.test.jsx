import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockDelete = vi.fn();

vi.mock('../../services/api.js', () => ({
  default: {
    get: mockGet,
    post: mockPost,
    delete: mockDelete,
  },
}));

describe('salas service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list salas', async () => {
    const fakeData = [{ id: 1, nombre: 'Sala 1' }];

    mockGet.mockResolvedValue({
      data: fakeData,
    });

    const { listarSalas } = await import('../../services/salas.service.js');

    const result = await listarSalas();

    expect(mockGet).toHaveBeenCalledWith('/salas');
    expect(result).toEqual(fakeData);
  });

  it('should get sala by id', async () => {
    const fakeData = { id: 1, nombre: 'Sala Test' };

    mockGet.mockResolvedValue({
      data: fakeData,
    });

    const { obtenerSala } = await import('../../services/salas.service.js');

    const result = await obtenerSala(1);

    expect(mockGet).toHaveBeenCalledWith('/salas/1');
    expect(result).toEqual(fakeData);
  });

  it('should create sala', async () => {
    const payload = {
      nombre: 'Nueva Sala',
    };

    const fakeData = {
      id: 1,
      ...payload,
    };

    mockPost.mockResolvedValue({
      data: fakeData,
    });

    const { crearSala } = await import('../../services/salas.service.js');

    const result = await crearSala(payload);

    expect(mockPost).toHaveBeenCalledWith(
      '/salas',
      payload
    );

    expect(result).toEqual(fakeData);
  });

  it('should delete sala', async () => {
    mockDelete.mockResolvedValue({});

    const { eliminarSala } = await import('../../services/salas.service.js');

    await eliminarSala(5);

    expect(mockDelete).toHaveBeenCalledWith(
      '/salas/5'
    );
  });

  it('should expel user from sala', async () => {
    mockDelete.mockResolvedValue({});

    const { expulsarUsuario } = await import('../../services/salas.service.js');

    await expulsarUsuario(1, 'Eduardo Test');

    expect(mockDelete).toHaveBeenCalledWith(
      '/salas/1/usuarios/Eduardo%20Test'
    );
  });

  it('should join sala', async () => {
    const payload = {
      codigo: 'ABC123',
    };

    const fakeData = {
      success: true,
    };

    mockPost.mockResolvedValue({
      data: fakeData,
    });

    const { unirseSala } = await import('../../services/salas.service.js');

    const result = await unirseSala(payload);

    expect(mockPost).toHaveBeenCalledWith(
      '/salas/unirse',
      payload
    );

    expect(result).toEqual(fakeData);
  });

  it('should upload file', async () => {
    const fakeFile = new File(
      ['contenido'],
      'test.txt',
      {
        type: 'text/plain',
      }
    );

    const fakeResponse = {
      success: true,
    };

    mockPost.mockResolvedValue({
      data: fakeResponse,
    });

    const { subirArchivo } = await import('../../services/salas.service.js');

    const result = await subirArchivo(
      1,
      fakeFile,
      'token123'
    );

    expect(mockPost).toHaveBeenCalled();

    const callArgs = mockPost.mock.calls[0];

    expect(callArgs[0]).toBe(
      '/salas/1/archivos'
    );

    expect(callArgs[2]).toEqual({
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-Session-Token': 'token123',
      },
    });

    expect(result).toEqual(fakeResponse);
  });
});