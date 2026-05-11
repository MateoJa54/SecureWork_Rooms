describe('broadcast.worker', () => {
  let handler;
  let mockPostMessage;
  let mockOn;

  beforeEach(() => {
    jest.resetModules();

    mockPostMessage = jest.fn();
    mockOn = jest.fn();

    jest.doMock('worker_threads', () => ({
      parentPort: {
        on: mockOn,
        postMessage: mockPostMessage,
      },
    }));

    require('../../src/workers/broadcast.worker');

    handler = mockOn.mock.calls[0][1];
  });

  test('debe registrar listener message', () => {
    expect(mockOn).toHaveBeenCalledWith(
      'message',
      expect.any(Function)
    );
  });

  test('debe preparar broadcast correctamente', async () => {
    const payload = {
      mensaje: 'hola',
      usuario: 'eduardo',
    };

    await handler({
      id: 1,
      type: 'broadcast',
      payload,
    });

    expect(mockPostMessage).toHaveBeenCalledWith({
      id: 1,
      result: JSON.stringify(payload),
    });
  });

  test('debe manejar operacion desconocida', async () => {
    await handler({
      id: 2,
      type: 'invalid',
      payload: {},
    });

    expect(mockPostMessage).toHaveBeenCalledWith({
      id: 2,
      error: 'operacion desconocida',
    });
  });

  test('debe manejar error de serializacion', async () => {
    const circular = {};

    circular.self = circular;

    await handler({
      id: 3,
      type: 'broadcast',
      payload: circular,
    });

    expect(mockPostMessage).toHaveBeenCalledWith({
      id: 3,
      error: expect.any(String),
    });
  });
});