import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest';

import {
  renderHook,
  waitFor,
} from '@testing-library/react';

const mockObtenerSala = vi.fn();

vi.mock('../../services/salas.service.js', () => ({
  obtenerSala: mockObtenerSala,
}));

describe('useSala hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load sala successfully', async () => {
    const fakeSala = {
      id: 1,
      nombre: 'Sala Test',
    };

    mockObtenerSala.mockResolvedValue(
      fakeSala
    );

    const { useSala } = await import(
      '../../hooks/useSala.js'
    );

    const { result } = renderHook(() =>
      useSala(1)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(
        false
      );
    });

    expect(result.current.sala).toEqual(
      fakeSala
    );

    expect(result.current.error).toBeNull();
  });

  it('should handle sala loading error', async () => {
    mockObtenerSala.mockRejectedValue(
      new Error('Error loading sala')
    );

    const { useSala } = await import(
      '../../hooks/useSala.js'
    );

    const { result } = renderHook(() =>
      useSala(1)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(
        false
      );
    });

    expect(result.current.error).toBe(
      'Error loading sala'
    );
  });

  it('should not load sala if id does not exist', async () => {
    const { useSala } = await import(
      '../../hooks/useSala.js'
    );

    const { result } = renderHook(() =>
      useSala(null)
    );

    expect(result.current.sala).toBeNull();

    expect(mockObtenerSala).not.toHaveBeenCalled();
  });

  it('should reload sala manually', async () => {
    const fakeSala = {
      id: 1,
      nombre: 'Sala Reload',
    };

    mockObtenerSala.mockResolvedValue(
      fakeSala
    );

    const { useSala } = await import(
      '../../hooks/useSala.js'
    );

    const { result } = renderHook(() =>
      useSala(1)
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(
        false
      );
    });

    await result.current.recargar();

    expect(mockObtenerSala).toHaveBeenCalledTimes(2);
  });
});