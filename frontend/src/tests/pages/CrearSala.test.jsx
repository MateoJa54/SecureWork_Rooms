import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import CrearSala from '../../pages/CrearSala';

// mocks
const mockNavigate = vi.fn();
const mockCrearSala = vi.fn();

// react-router mock
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// service mock
vi.mock('../../services/salas.service.js', () => ({
  crearSala: (...args) => mockCrearSala(...args),
}));

// SalaForm mock (IMPORTANTE para controlar submit)
vi.mock('../../components/admin/SalaForm.jsx', () => ({
  default: ({ onSubmit, loading }) => (
    <div>
      <button
        onClick={() =>
          onSubmit({
            nombre: 'Sala test',
            descripcion: 'Desc test',
          })
        }
      >
        Crear sala
      </button>

      <span>{loading ? 'loading' : 'idle'}</span>
    </div>
  ),
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <CrearSala />
    </MemoryRouter>
  );

describe('CrearSala page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render page correctly', () => {
    renderPage();

    expect(screen.getByText(/nueva sala/i)).toBeInTheDocument();
    expect(screen.getByText(/volver al dashboard/i)).toBeInTheDocument();
  });

  it('should call crearSala and navigate on submit', async () => {
    mockCrearSala.mockResolvedValueOnce({ id: 1 });

    renderPage();

    fireEvent.click(screen.getByText(/crear sala/i));

    await waitFor(() => {
      expect(mockCrearSala).toHaveBeenCalledWith({
        nombre: 'Sala test',
        descripcion: 'Desc test',
      });

      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  it('should show loading state while creating sala', async () => {
    let resolveFn;
    mockCrearSala.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFn = resolve;
        })
    );

    renderPage();

    fireEvent.click(screen.getByText(/crear sala/i));

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    resolveFn({ id: 1 });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  it('should always stop loading after submit', async () => {
    mockCrearSala.mockResolvedValueOnce({ id: 1 });

    renderPage();

    fireEvent.click(screen.getByText(/crear sala/i));

    await waitFor(() => {
      expect(screen.getByText(/idle/i)).toBeInTheDocument();
    });
  });
});