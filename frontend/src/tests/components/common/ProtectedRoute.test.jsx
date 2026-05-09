import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../../../components/common/ProtectedRoute.jsx';

vi.mock('../../../hooks/useAuth.js', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../../hooks/useAuth.js';

describe('ProtectedRoute component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading spinner', () => {
    useAuth.mockReturnValue({
      user: null,
      loading: true,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Contenido privado</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('should redirect if user does not exist', () => {
    useAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Contenido privado</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument();
  });

  it('should render children if user exists', () => {
    useAuth.mockReturnValue({
      user: { id: 1, email: 'test@test.com' },
      loading: false,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Contenido privado</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Contenido privado')).toBeInTheDocument();
  });
});