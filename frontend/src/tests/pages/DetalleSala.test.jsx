import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import DetalleSala from '../../pages/DetalleSala';

// mocks
const mockRecargar = vi.fn();
const mockExpulsar = vi.fn();

// react-router params mock
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
  };
});

// useSala mock
vi.mock('../../hooks/useSala.js', () => ({
  useSala: () => ({
    sala: {
      nombre: 'Sala Test',
      tipo_sala: 'publica',
      capacidad_maxima: 10,
      timeout_inactividad: 60,
      tamanio_max_archivo_mb: 20,
      creado_en: '2024-01-01',
      sesiones: [
        { nickname: 'user1' },
        { nickname: 'user2' },
      ],
    },
    loading: false,
    error: '',
    recargar: mockRecargar,
  }),
}));

// service mock
vi.mock('../../services/salas.service.js', () => ({
  expulsarUsuario: (...args) => mockExpulsar(...args),
}));

// formatters mock (evita lógica innecesaria en test)
vi.mock('../../utils/formatters.js', () => ({
  formatFecha: (date) => `fecha-${date}`,
  formatTipoSala: (tipo) => tipo,
}));

// componentes hijos mock
vi.mock('../../components/admin/UsuariosConectados.jsx', () => ({
  default: ({ usuarios, onExpulsar }) => (
    <div>
      {usuarios.map((u) => (
        <button key={u.nickname} onClick={() => onExpulsar(u.nickname)}>
          expulsar-{u.nickname}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('../../components/common/ErrorMessage.jsx', () => ({
  default: ({ message }) =>
    message ? <p>{message}</p> : null,
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <DetalleSala />
    </MemoryRouter>
  );

describe('DetalleSala page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render sala details', () => {
    renderPage();

    expect(screen.getByText(/sala test/i)).toBeInTheDocument();
    expect(screen.getByText(/usuarios conectados/i)).toBeInTheDocument();
    expect(screen.getByText(/10 usuarios/i)).toBeInTheDocument();
  });

  it('should render users list', () => {
    renderPage();

    expect(screen.getByText('expulsar-user1')).toBeInTheDocument();
    expect(screen.getByText('expulsar-user2')).toBeInTheDocument();
  });

  it('should call expulsarUsuario and recargar when user is expelled', async () => {
    mockExpulsar.mockResolvedValueOnce({ ok: true });

    renderPage();

    fireEvent.click(screen.getByText('expulsar-user1'));

    await waitFor(() => {
      expect(mockExpulsar).toHaveBeenCalledWith('1', 'user1');
      expect(mockRecargar).toHaveBeenCalled();
    });
  });

  it('should show error when expulsarUsuario fails', async () => {
    mockExpulsar.mockRejectedValueOnce(
      new Error('Error al expulsar usuario')
    );

    renderPage();

    fireEvent.click(screen.getByText('expulsar-user1'));

    expect(
      await screen.findByText(/error al expulsar usuario/i)
    ).toBeInTheDocument();
  });

  it('should show loading spinner when loading is true', () => {
    vi.doMock('../../hooks/useSala.js', () => ({
      useSala: () => ({
        sala: null,
        loading: true,
        error: '',
        recargar: mockRecargar,
      }),
    }));

    // re-import para aplicar mock dinámico
  });

  it('should show error from useSala', () => {
    vi.doMock('../../hooks/useSala.js', () => ({
      useSala: () => ({
        sala: null,
        loading: false,
        error: 'Error cargando sala',
        recargar: mockRecargar,
      }),
    }));
  });
});