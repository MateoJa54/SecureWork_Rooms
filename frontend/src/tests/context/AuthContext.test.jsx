import React from 'react';

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest';

import {
  render,
  screen,
  waitFor,
  fireEvent,
} from '@testing-library/react';

const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();

const mockLoginService = vi.fn();
const mockLogoutService = vi.fn();

vi.mock('../../services/supabase.client.js', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  },
}));

vi.mock('../../services/auth.service.js', () => ({
  login: mockLoginService,
  logout: mockLogoutService,
}));

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load initial session', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: {
            email: 'test@test.com',
          },
        },
      },
    });

    mockOnAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    });

    const {
      AuthProvider,
      AuthContext,
    } = await import(
      '../../context/AuthContext.jsx'
    );

    function TestComponent() {
      return (
        <AuthContext.Consumer>
          {(value) => (
            <div>
              <span>
                {value.user?.email}
              </span>

              <span>
                {String(value.loading)}
              </span>
            </div>
          )}
        </AuthContext.Consumer>
      );
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(
        screen.getByText('test@test.com')
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText('false')
    ).toBeInTheDocument();
  });

  it('should login correctly', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: null,
      },
    });

    mockOnAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    });

    mockLoginService.mockResolvedValue({
      user: {
        email: 'login@test.com',
      },
    });

    const {
      AuthProvider,
      AuthContext,
    } = await import(
      '../../context/AuthContext.jsx'
    );

    function TestComponent() {
      return (
        <AuthContext.Consumer>
          {(value) => (
            <button
              onClick={() =>
                value.login(
                  'a@test.com',
                  '123456'
                )
              }
            >
              Login
            </button>
          )}
        </AuthContext.Consumer>
      );
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(
      screen.getByText('Login')
    );

    await waitFor(() => {
      expect(
        mockLoginService
      ).toHaveBeenCalled();
    });
  });

  it('should logout correctly', async () => {
    mockGetSession.mockResolvedValue({
      data: {
        session: {
          user: {
            email: 'test@test.com',
          },
        },
      },
    });

    mockOnAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    });

    const {
      AuthProvider,
      AuthContext,
    } = await import(
      '../../context/AuthContext.jsx'
    );

    function TestComponent() {
      return (
        <AuthContext.Consumer>
          {(value) => (
            <button
              onClick={() =>
                value.logout()
              }
            >
              Logout
            </button>
          )}
        </AuthContext.Consumer>
      );
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(
      screen.getByText('Logout')
    );

    await waitFor(() => {
      expect(
        mockLogoutService
      ).toHaveBeenCalled();
    });
  });

  it('should unsubscribe on cleanup', async () => {
    const unsubscribeMock = vi.fn();

    mockGetSession.mockResolvedValue({
      data: {
        session: null,
      },
    });

    mockOnAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: unsubscribeMock,
        },
      },
    });

    const {
      AuthProvider,
    } = await import(
      '../../context/AuthContext.jsx'
    );

    const { unmount } = render(
      <AuthProvider>
        <div>Test</div>
      </AuthProvider>
    );

    unmount();

    expect(
      unsubscribeMock
    ).toHaveBeenCalled();
  });
});