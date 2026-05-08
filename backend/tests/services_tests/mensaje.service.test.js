jest.mock('../../src/repositories/mensajes.repository', () => ({
  insertar: jest.fn(),
  obtenerHistorial: jest.fn(),
}));

jest.mock('../../src/repositories/salas.repository', () => ({
  buscarPorId: jest.fn(),
}));

jest.mock('../../src/repositories/sesiones.repository', () => ({
  listarPorSala: jest.fn(),
  actualizarActividadPorNickname: jest.fn(),
}));

const MensajesRepository = require('../../src/repositories/mensajes.repository');
const SalasRepository = require('../../src/repositories/salas.repository');
const SesionesRepository = require('../../src/repositories/sesiones.repository');

const {
  procesarMensaje,
  obtenerEstadoInicial,
} = require('../../src/services/mensajes.service');

describe('Mensajes Service', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // prueba: debe procesar mensaje correctamente
  test('debe procesar mensaje correctamente', async () => {

    const mensajeMock = {
      id: 1,
      contenido: 'hola',
    };

    MensajesRepository.insertar.mockResolvedValue(mensajeMock);

    SesionesRepository.actualizarActividadPorNickname
      .mockResolvedValue();

    const result = await procesarMensaje({
      sala_id: 1,
      nickname: 'eduardo',
      contenido: ' hola ',
      io: {},
    });

    expect(MensajesRepository.insertar)
      .toHaveBeenCalledWith({
        sala_id: 1,
        nickname: 'eduardo',
        contenido: 'hola',
      });

    expect(SesionesRepository.actualizarActividadPorNickname)
      .toHaveBeenCalledWith(
        1,
        'eduardo'
      );

    expect(result).toEqual(mensajeMock);
  });

  // prueba: debe fallar si contenido vacío
  test('debe fallar si contenido está vacío', async () => {

    await expect(
      procesarMensaje({
        sala_id: 1,
        nickname: 'eduardo',
        contenido: '',
        io: {},
      })
    ).rejects.toThrow('Contenido vacío');
  });

  // prueba: debe asignar statusCode 400 contenido vacío
  test('debe asignar statusCode 400 si contenido vacío', async () => {

    try {
      await procesarMensaje({
        sala_id: 1,
        nickname: 'eduardo',
        contenido: '',
        io: {},
      });
    } catch (err) {
      expect(err.statusCode).toBe(400);
    }
  });

  // prueba: debe fallar si mensaje muy largo
  test('debe fallar si mensaje es muy largo', async () => {

    const contenido = 'a'.repeat(2001);

    await expect(
      procesarMensaje({
        sala_id: 1,
        nickname: 'eduardo',
        contenido,
        io: {},
      })
    ).rejects.toThrow(
      'Mensaje demasiado largo (máx 2000 chars)'
    );
  });

  // prueba: debe asignar statusCode 400 mensaje largo
  test('debe asignar statusCode 400 si mensaje largo', async () => {

    const contenido = 'a'.repeat(2001);

    try {
      await procesarMensaje({
        sala_id: 1,
        nickname: 'eduardo',
        contenido,
        io: {},
      });
    } catch (err) {
      expect(err.statusCode).toBe(400);
    }
  });

  // prueba: debe ignorar error al actualizar actividad
  test('debe ignorar error al actualizar actividad', async () => {

    MensajesRepository.insertar.mockResolvedValue({
      id: 1,
    });

    SesionesRepository.actualizarActividadPorNickname
      .mockRejectedValue(new Error('fail'));

    const result = await procesarMensaje({
      sala_id: 1,
      nickname: 'eduardo',
      contenido: 'hola',
      io: {},
    });

    expect(result).toEqual({
      id: 1,
    });
  });

  // prueba: debe obtener estado inicial
  test('debe obtener estado inicial correctamente', async () => {

    SalasRepository.buscarPorId.mockResolvedValue({
      id: 1,
      nombre: 'Sala',
      pin_hash: 'secret',
      pin_plano: '1234',
      activa: true,
    });

    SesionesRepository.listarPorSala.mockResolvedValue([
      {
        nickname: 'eduardo',
      },
    ]);

    MensajesRepository.obtenerHistorial.mockResolvedValue([
      {
        contenido: 'hola',
      },
    ]);

    const result = await obtenerEstadoInicial(1);

    expect(SalasRepository.buscarPorId)
      .toHaveBeenCalledWith(1);

    expect(SesionesRepository.listarPorSala)
      .toHaveBeenCalledWith(1);

    expect(MensajesRepository.obtenerHistorial)
      .toHaveBeenCalledWith(1, 50);

    expect(result).toEqual({
      sala: {
        id: 1,
        nombre: 'Sala',
        activa: true,
      },
      usuarios: [
        {
          nickname: 'eduardo',
        },
      ],
      mensajes_recientes: [
        {
          contenido: 'hola',
        },
      ],
    });
  });

});