import {
  describe,
  it,
  expect,
  vi,
} from 'vitest';

import { renderHook } from '@testing-library/react';

const mockGetDeviceId = vi.fn();

vi.mock('../../services/device.service.js', () => ({
  getDeviceId: mockGetDeviceId,
}));

describe('useDeviceId hook', () => {
  it('should return device id', async () => {
    mockGetDeviceId.mockReturnValue(
      'device-123'
    );

    const { useDeviceId } = await import(
      '../../hooks/useDeviceId.js'
    );

    const { result } = renderHook(() =>
      useDeviceId()
    );

    expect(result.current).toBe(
      'device-123'
    );
  });
});