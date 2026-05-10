import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import UnirseSala from '../../pages/UnirseSala.jsx';

/* =========================
   MOCKS
========================= */

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// servicio salas
const unirseSalaMock = vi.fn();

vi.mock('../../services/salas.service.js', () => ({
  unirseSala: (...args) => unirseSalaMock(...args)
}));

// device service
const saveSessionMock = vi.fn();

vi.mock('../../services/device.service.js', () => ({
  getDeviceId: () => 'device-123',
  getFingerprint: async () => 'fingerprint-abc',
  saveSession: (...args) => saveSessionMock(...args)
}));

// componentes UI simplificados
vi.mock('../../components/common/Input.jsx', () => ({
  default: ({ label, value, onChange, type }) => (
    <div>
      <label>{label}</label>
      <input
        data-testid={label}
        value={value}
        type={type || 'text'}
        onChange={onChange}
      />
    </div>
  )
}));

vi.mock('../../components/common/Button.jsx', () => ({
  default: ({ children, onClick, type, loading }) => (
    <button type={type} onClick={onClick} disabled={loading}>
      {loading ? 'Cargando...' : children}
    </button>
  )
}));

vi.mock('../../components/common/ErrorMessage.jsx', () => ({
  default: ({ message }) =>
    message ? <p data-testid="error">{message}</p> : null
}));

/* =========================
   TESTS
========================= */

describe('UnirseSala page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = () =>
    render(
      <MemoryRouter>
        <UnirseSala />
      </MemoryRouter>
    );

  // ✅ CORREGIDO: eliminado getByText duplicado (causaba fallo)
  test('should render form correctly', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { name: /unirse a una sala/i })
    ).toBeInTheDocument();

    expect(screen.getByTestId('Nombre de la sala')).toBeInTheDocument();
    expect(screen.getByTestId('PIN')).toBeInTheDocument();
    expect(screen.getByTestId('Tu apodo (nickname)')).toBeInTheDocument();
  });

  test('should update inputs correctly', () => {
    renderPage();

    fireEvent.change(screen.getByTestId('Nombre de la sala'), {
      target: { value: 'Sala 1' }
    });

    fireEvent.change(screen.getByTestId('PIN'), {
      target: { value: '1234' }
    });

    fireEvent.change(screen.getByTestId('Tu apodo (nickname)'), {
      target: { value: 'Eduardo' }
    });

    expect(screen.getByTestId('Nombre de la sala').value).toBe('Sala 1');
    expect(screen.getByTestId('PIN').value).toBe('1234');
    expect(screen.getByTestId('Tu apodo (nickname)').value).toBe('Eduardo');
  });

  test('should call unirseSala and navigate on success', async () => {
    unirseSalaMock.mockResolvedValue({
      session_token: 'token-123',
      sala_id: '10'
    });

    renderPage();

    fireEvent.change(screen.getByTestId('Nombre de la sala'), {
      target: { value: 'Sala A' }
    });

    fireEvent.change(screen.getByTestId('PIN'), {
      target: { value: '9999' }
    });

    fireEvent.change(screen.getByTestId('Tu apodo (nickname)'), {
      target: { value: 'Eduardo' }
    });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(unirseSalaMock).toHaveBeenCalledWith({
        nombre_sala: 'Sala A',
        pin: '9999',
        nickname: 'Eduardo',
        device_id: 'device-123',
        fingerprint: 'fingerprint-abc'
      });
    });

    expect(saveSessionMock).toHaveBeenCalledWith(
      'token-123',
      '10',
      'Eduardo'
    );

    expect(mockNavigate).toHaveBeenCalledWith('/sala/10');
  });

  test('should show error when API fails', async () => {
    unirseSalaMock.mockRejectedValue(new Error('PIN incorrecto'));

    renderPage();

    fireEvent.change(screen.getByTestId('Nombre de la sala'), {
      target: { value: 'Sala A' }
    });

    fireEvent.change(screen.getByTestId('PIN'), {
      target: { value: 'wrong' }
    });

    fireEvent.change(screen.getByTestId('Tu apodo (nickname)'), {
      target: { value: 'Eduardo' }
    });

    fireEvent.click(screen.getByRole('button'));

    expect(await screen.findByTestId('error')).toHaveTextContent(
      'PIN incorrecto'
    );
  });

  test('should show loading state while submitting', async () => {
    let resolvePromise;

    unirseSalaMock.mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve;
      })
    );

    renderPage();

    fireEvent.change(screen.getByTestId('Nombre de la sala'), {
      target: { value: 'Sala A' }
    });

    fireEvent.change(screen.getByTestId('PIN'), {
      target: { value: '1234' }
    });

    fireEvent.change(screen.getByTestId('Tu apodo (nickname)'), {
      target: { value: 'Eduardo' }
    });

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Cargando...')).toBeInTheDocument();

    resolvePromise({
      session_token: 'token',
      sala_id: '1'
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });
});