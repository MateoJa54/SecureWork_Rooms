import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest';

const mockIo = vi.fn();
const mockGetDeviceId = vi.fn();

vi.mock('socket.io-client', () => ({
  io: mockIo,
}));

vi.mock('../../services/device.service.js', () => ({
  getDeviceId: mockGetDeviceId,
}));

describe('socket service', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should connect socket correctly', async () => {
    const fakeSocket = {
      connected: false,
      disconnect: vi.fn(),
    };

    mockGetDeviceId.mockReturnValue(
      'device-123'
    );

    mockIo.mockReturnValue(fakeSocket);

    const { conectar } = await import(
      '../../services/socket.service.js'
    );

    const result = conectar('token123');

    expect(mockIo).toHaveBeenCalledWith(
      'http://localhost:3000',
      {
        auth: {
          session_token: 'token123',
          device_id: 'device-123',
        },
        transports: ['websocket'],
        reconnectionAttempts: 5,
      }
    );

    expect(result).toBe(fakeSocket);
  });

  it('should return existing connected socket', async () => {
    const fakeSocket = {
      connected: true,
      disconnect: vi.fn(),
    };

    mockGetDeviceId.mockReturnValue(
      'device-123'
    );

    mockIo.mockReturnValue(fakeSocket);

    const { conectar } = await import(
      '../../services/socket.service.js'
    );

    const firstConnection = conectar('token123');

    const secondConnection = conectar('token456');

    expect(secondConnection).toBe(
      firstConnection
    );

    expect(mockIo).toHaveBeenCalledTimes(1);
  });

  it('should return current socket', async () => {
    const fakeSocket = {
      connected: false,
      disconnect: vi.fn(),
    };

    mockGetDeviceId.mockReturnValue(
      'device-123'
    );

    mockIo.mockReturnValue(fakeSocket);

    const {
      conectar,
      getSocket,
    } = await import(
      '../../services/socket.service.js'
    );

    conectar('token123');

    expect(getSocket()).toBe(fakeSocket);
  });

  it('should disconnect socket correctly', async () => {
    const disconnectMock = vi.fn();

    const fakeSocket = {
      connected: false,
      disconnect: disconnectMock,
    };

    mockGetDeviceId.mockReturnValue(
      'device-123'
    );

    mockIo.mockReturnValue(fakeSocket);

    const {
      conectar,
      desconectar,
      getSocket,
    } = await import(
      '../../services/socket.service.js'
    );

    conectar('token123');

    desconectar();

    expect(disconnectMock).toHaveBeenCalled();

    expect(getSocket()).toBeNull();
  });

  it('should handle disconnect without socket', async () => {
    const {
      desconectar,
      getSocket,
    } = await import(
      '../../services/socket.service.js'
    );

    desconectar();

    expect(getSocket()).toBeNull();
  });
});