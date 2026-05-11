let bcrypt;

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
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

describe('bcrypt.worker', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    bcrypt = require('bcryptjs');

    require('../../src/workers/bcrypt.worker');
  });

  test('debe hacer hash correctamente', async () => {

    bcrypt.hash.mockResolvedValue('hashedPassword');

    await handler({
      id: 1,
      type: 'hash',
      payload: {
        plaintext: '1234',
      },
    });

    expect(bcrypt.hash).toHaveBeenCalledWith(
      '1234',
      10
    );

    expect(mockPostMessage).toHaveBeenCalledWith({
      id: 1,
      result: 'hashedPassword',
    });

  });

  test('debe hacer compare correctamente', async () => {

    bcrypt.compare.mockResolvedValue(true);

    await handler({
      id: 2,
      type: 'compare',
      payload: {
        plaintext: '1234',
        hash: 'hash',
      },
    });

    expect(bcrypt.compare).toHaveBeenCalledWith(
      '1234',
      'hash'
    );

    expect(mockPostMessage).toHaveBeenCalledWith({
      id: 2,
      result: true,
    });

  });

  test('debe manejar operacion desconocida', async () => {

    await handler({
      id: 3,
      type: 'otro',
      payload: {},
    });

    expect(mockPostMessage).toHaveBeenCalledWith({
      id: 3,
      error: 'operacion desconocida',
    });

  });

  test('debe manejar errores internos', async () => {

    bcrypt.hash.mockRejectedValue(
      new Error('bcrypt error')
    );

    await handler({
      id: 4,
      type: 'hash',
      payload: {
        plaintext: '1234',
      },
    });

    expect(mockPostMessage).toHaveBeenCalledWith({
      id: 4,
      error: 'bcrypt error',
    });

  });

});