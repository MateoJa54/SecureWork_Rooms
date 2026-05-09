import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest';

describe('fingerprint utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate fingerprint hash', async () => {
    const fakeHashBuffer = new Uint8Array([
      1, 2, 3, 4,
    ]).buffer;

    vi.stubGlobal('crypto', {
      subtle: {
        digest: vi.fn().mockResolvedValue(
          fakeHashBuffer
        ),
      },
    });

    const { generarFingerprint } = await import(
      '../../utils/fingerprint.js'
    );

    const result = await generarFingerprint();

    expect(result).toBe('01020304');
  });
});