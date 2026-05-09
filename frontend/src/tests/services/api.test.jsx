import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetSession = vi.fn();

vi.mock('../../services/supabase.client.js', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
    },
  },
}));

describe('api service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add authorization token to headers', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'fake-token',
        },
      },
    });

    const { default: api } = await import('../../services/api.js');

    const interceptor =
      api.interceptors.request.handlers[0].fulfilled;

    const config = {
      headers: {},
    };

    const result = await interceptor(config);

    expect(result.headers.Authorization).toBe(
      'Bearer fake-token'
    );
  });

  it('should not add authorization header if no session exists', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: null,
      },
    });

    const { default: api } = await import('../../services/api.js');

    const interceptor =
      api.interceptors.request.handlers[0].fulfilled;

    const config = {
      headers: {},
    };

    const result = await interceptor(config);

    expect(result.headers.Authorization).toBeUndefined();
  });

  it('should return response correctly', async () => {
    const { default: api } = await import('../../services/api.js');

    const responseInterceptor =
      api.interceptors.response.handlers[0].fulfilled;

    const response = {
      data: 'success',
    };

    const result = responseInterceptor(response);

    expect(result).toEqual(response);
  });

  it('should transform axios error message correctly', async () => {
    const { default: api } = await import('../../services/api.js');

    const errorInterceptor =
      api.interceptors.response.handlers[0].rejected;

    const error = {
      response: {
        data: {
          error: 'Custom backend error',
        },
      },
      message: 'Axios error',
    };

    await expect(errorInterceptor(error)).rejects.toThrow(
      'Custom backend error'
    );
  });

  it('should fallback to default error message', async () => {
    const { default: api } = await import('../../services/api.js');

    const errorInterceptor =
      api.interceptors.response.handlers[0].rejected;

    const error = {
      message: 'Generic axios error',
    };

    await expect(errorInterceptor(error)).rejects.toThrow(
      'Generic axios error'
    );
  });
});