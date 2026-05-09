import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest';

const mockFingerprint = vi.fn();

vi.mock('../../utils/fingerprint.js', () => ({
  generarFingerprint: mockFingerprint,
}));

describe('device service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should generate and save device id if not exists', async () => {
    const mockUUID = 'fake-device-id';

    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => mockUUID),
    });

    const { getDeviceId } = await import(
      '../../services/device.service.js'
    );

    const result = getDeviceId();

    expect(result).toBe(mockUUID);

    expect(
      localStorage.getItem('swr_device_id')
    ).toBe(mockUUID);
  });

  it('should return existing device id', async () => {
    localStorage.setItem(
      'swr_device_id',
      'existing-id'
    );

    const { getDeviceId } = await import(
      '../../services/device.service.js'
    );

    const result = getDeviceId();

    expect(result).toBe('existing-id');
  });

  it('should return fingerprint', async () => {
    mockFingerprint.mockResolvedValue(
      'fingerprint123'
    );

    const { getFingerprint } = await import(
      '../../services/device.service.js'
    );

    const result = await getFingerprint();

    expect(result).toBe('fingerprint123');
  });

  it('should save session data', async () => {
    const { saveSession } = await import(
      '../../services/device.service.js'
    );

    saveSession(
      'token123',
      'sala456',
      'Eduardo'
    );

    expect(
      localStorage.getItem('swr_session_token')
    ).toBe('token123');

    expect(
      localStorage.getItem('swr_sala_id')
    ).toBe('sala456');

    expect(
      localStorage.getItem('swr_nickname')
    ).toBe('Eduardo');
  });

  it('should save session without nickname', async () => {
    const { saveSession } = await import(
      '../../services/device.service.js'
    );

    saveSession(
      'token123',
      'sala456'
    );

    expect(
      localStorage.getItem('swr_session_token')
    ).toBe('token123');

    expect(
      localStorage.getItem('swr_sala_id')
    ).toBe('sala456');

    expect(
      localStorage.getItem('swr_nickname')
    ).toBeNull();
  });

  it('should get nickname', async () => {
    localStorage.setItem(
      'swr_nickname',
      'Eduardo'
    );

    const { getNickname } = await import(
      '../../services/device.service.js'
    );

    const result = getNickname();

    expect(result).toBe('Eduardo');
  });

  it('should return empty nickname if none exists', async () => {
    const { getNickname } = await import(
      '../../services/device.service.js'
    );

    const result = getNickname();

    expect(result).toBe('');
  });

  it('should get session token', async () => {
    localStorage.setItem(
      'swr_session_token',
      'token123'
    );

    const { getSessionToken } = await import(
      '../../services/device.service.js'
    );

    const result = getSessionToken();

    expect(result).toBe('token123');
  });

  it('should get sala id', async () => {
    localStorage.setItem(
      'swr_sala_id',
      'sala456'
    );

    const { getSalaId } = await import(
      '../../services/device.service.js'
    );

    const result = getSalaId();

    expect(result).toBe('sala456');
  });

  it('should clear session data', async () => {
    localStorage.setItem(
      'swr_session_token',
      'token123'
    );

    localStorage.setItem(
      'swr_sala_id',
      'sala456'
    );

    localStorage.setItem(
      'swr_nickname',
      'Eduardo'
    );

    const { clearSession } = await import(
      '../../services/device.service.js'
    );

    clearSession();

    expect(
      localStorage.getItem('swr_session_token')
    ).toBeNull();

    expect(
      localStorage.getItem('swr_sala_id')
    ).toBeNull();

    expect(
      localStorage.getItem('swr_nickname')
    ).toBeNull();
  });
});