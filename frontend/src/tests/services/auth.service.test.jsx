import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();
const mockGetSession = vi.fn();
const mockGetUser = vi.fn();
const mockPost = vi.fn();

vi.mock('../../services/supabase.client.js', () => ({
  supabase: {
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
      getSession: mockGetSession,
      getUser: mockGetUser,
    },
  },
}));

vi.mock('../../services/api.js', () => ({
  default: {
    post: mockPost,
  },
}));

describe('auth service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should login successfully', async () => {
    const fakeSession = {
      access_token: 'token123',
    };

    mockSignInWithPassword.mockResolvedValue({
      data: {
        session: fakeSession,
      },
      error: null,
    });

    mockPost.mockResolvedValue({});

    const { login } = await import('../../services/auth.service.js');

    const result = await login(
      'test@test.com',
      '123456'
    );

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: '123456',
    });

    expect(mockPost).toHaveBeenCalledWith(
      '/auth/verify'
    );

    expect(result).toEqual(fakeSession);
  });

  it('should throw error if login fails', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: null,
      error: {
        message: 'Invalid credentials',
      },
    });

    const { login } = await import('../../services/auth.service.js');

    await expect(
      login('wrong@test.com', 'wrongpass')
    ).rejects.toThrow('Invalid credentials');
  });

  it('should logout successfully', async () => {
    mockSignOut.mockResolvedValue({});

    const { logout } = await import('../../services/auth.service.js');

    await logout();

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('should return current session', async () => {
    const fakeSession = {
      access_token: 'session-token',
    };

    mockGetSession.mockResolvedValue({
      data: {
        session: fakeSession,
      },
    });

    const { getSession } = await import('../../services/auth.service.js');

    const result = await getSession();

    expect(result).toEqual(fakeSession);
  });

  it('should return current user', async () => {
    const fakeUser = {
      id: '123',
      email: 'user@test.com',
    };

    mockGetUser.mockResolvedValue({
      data: {
        user: fakeUser,
      },
    });

    const { getUser } = await import('../../services/auth.service.js');

    const result = await getUser();

    expect(result).toEqual(fakeUser);
  });
});