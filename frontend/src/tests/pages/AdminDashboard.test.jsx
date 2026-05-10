import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import AdminDashboard from '../../pages/AdminDashboard';
import * as salasService from '../../services/salas.service';

// 🔥 MOCK useAuth (ESTO ARREGLA TU ERROR PRINCIPAL)
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { email: 'test@test.com' },
    logout: vi.fn(),
  }),
}));

// 🔥 MOCK servicios
vi.mock('../../services/salas.service', () => ({
  listarSalas: vi.fn(),
  eliminarSala: vi.fn(),
}));

const renderComponent = () => {
  return render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>
  );
};

describe('AdminDashboard page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading initially', async () => {
    salasService.listarSalas.mockReturnValue(new Promise(() => {})); // nunca resuelve

    renderComponent();

    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should render salas correctly', async () => {
    salasService.listarSalas.mockResolvedValue([
      { id: 1, nombre: 'Sala 1' },
      { id: 2, nombre: 'Sala 2' },
    ]);

    renderComponent();

    expect(await screen.findByText('Sala 1')).toBeInTheDocument();
    expect(screen.getByText('Sala 2')).toBeInTheDocument();
  });

  it('should render error message when listarSalas fails', async () => {
    salasService.listarSalas.mockRejectedValue(new Error('Error cargando salas'));

    renderComponent();

    expect(await screen.findByText('Error cargando salas')).toBeInTheDocument();
  });

  it('should navigate to create sala page', () => {
    salasService.listarSalas.mockResolvedValue([]);

    renderComponent();

    const link = screen.getByText('+ Nueva sala');
    expect(link.closest('a')).toHaveAttribute('href', '/admin/salas/nueva');
  });

  it('should delete sala correctly', async () => {
    salasService.listarSalas.mockResolvedValue([
      { id: 1, nombre: 'Sala 1' },
    ]);

    salasService.eliminarSala.mockResolvedValue();

    // mock confirm
    window.confirm = vi.fn(() => true);

    renderComponent();

    // esperar render
    const sala = await screen.findByText('Sala 1');
    expect(sala).toBeInTheDocument();

    // botón eliminar (depende de SalaCard, asumimos texto o botón)
    const deleteButton = screen.getByText(/eliminar/i);

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(salasService.eliminarSala).toHaveBeenCalledWith(1);
    });
  });
});