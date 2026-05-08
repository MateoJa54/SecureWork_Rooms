const mockFileTypeFromBuffer = jest.fn();

jest.mock('file-type', () => ({
  fileTypeFromBuffer: mockFileTypeFromBuffer,
}));

const mockPostMessage = jest.fn();
let handler;

jest.mock('worker_threads', () => ({
  parentPort: {
    on: jest.fn((event, cb) => {
      handler = cb;
    }),
    postMessage: mockPostMessage,
  },
}));

describe('file-validation.worker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    require('../../src/workers/file-validation.worker');
  });

  test('debe validar archivo permitido', async () => {
    mockFileTypeFromBuffer.mockResolvedValue({
      mime: 'image/png',
    });

    await handler({
      id: 1,
      operation: 'validate',
      data: {
        buffer: Buffer.from('fake'),
        mimeType: 'image/png',
      },
    });

    expect(mockPostMessage).toHaveBeenCalledWith({
      id: 1,
      result: {
        esValido: true,
        mimeDeclared: 'image/png',
        mimeReal: 'image/png',
      },
    });
  });

  test('debe invalidar mime no permitido', async () => {
    mockFileTypeFromBuffer.mockResolvedValue({
      mime: 'application/exe',
    });

    await handler({
      id: 2,
      operation: 'validate',
      data: {
        buffer: Buffer.from('fake'),
        mimeType: 'application/exe',
      },
    });

    expect(mockPostMessage).toHaveBeenCalledWith({
      id: 2,
      result: {
        esValido: false,
        mimeDeclared: 'application/exe',
        mimeReal: 'application/exe',
      },
    });
  });

  test('debe usar text/plain si no detecta mime', async () => {
    mockFileTypeFromBuffer.mockResolvedValue(null);

    await handler({
      id: 3,
      operation: 'validate',
      data: {
        buffer: Buffer.from('fake'),
        mimeType: null,
      },
    });

    expect(mockPostMessage).toHaveBeenCalledWith({
  id: 3,
  result: {
    esValido: true,
    mimeDeclared: null,
    mimeReal: 'text/plain',
  },
});

  });

  test('debe manejar operacion desconocida', async () => {
    await handler({
      id: 4,
      operation: 'otro',
      data: {},
    });

    expect(mockPostMessage).toHaveBeenCalledWith({
      id: 4,
      error: 'operacion desconocida',
    });
  });

  test('debe manejar errores internos', async () => {
    mockFileTypeFromBuffer.mockRejectedValue(
      new Error('error interno')
    );

    await handler({
      id: 5,
      operation: 'validate',
      data: {
        buffer: Buffer.from('fake'),
        mimeType: 'image/png',
      },
    });

    expect(mockPostMessage).toHaveBeenCalledWith({
      id: 5,
      error: 'error interno',
    });
  });
});