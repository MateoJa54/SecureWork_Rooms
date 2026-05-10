import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ErrorPage from '../../pages/ErrorPage';
import { MemoryRouter } from 'react-router-dom';

// mock react-router search params
const mockGet = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [
      {
        get: mockGet,
      },
    ],
  };
});

// mock Button (evita dependencias visuales)
vi.mock('../../components/common/Button.jsx', () => ({
  default: ({ children }) => <button>{children}</button>,
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <ErrorPage />
    </MemoryRouter>
  );

describe('ErrorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render default error message when no motivo is provided', () => {
    mockGet.mockReturnValue(null);

    renderPage();

    expect(
      screen.getByText(/ocurrió un error inesperado/i)
    ).toBeInTheDocument();
  });

  it('should render inactivity message', () => {
    mockGet.mockReturnValue('inactividad');

    renderPage();

    expect(
      screen.getByText(/fuiste desconectado por inactividad/i)
    ).toBeInTheDocument();
  });

  it('should render expulsion message', () => {
    mockGet.mockReturnValue('expulsion');

    renderPage();

    expect(
      screen.getByText(/el administrador te expulsó/i)
    ).toBeInTheDocument();
  });

  it('should render sala llena message', () => {
    mockGet.mockReturnValue('sala_llena');

    renderPage();

    expect(
      screen.getByText(/la sala está llena/i)
    ).toBeInTheDocument();
  });

  it('should render pin invalido message', () => {
    mockGet.mockReturnValue('pin_invalido');

    renderPage();

    expect(
      screen.getByText(/pin incorrecto/i)
    ).toBeInTheDocument();
  });

  it('should render dispositivo duplicado message', () => {
    mockGet.mockReturnValue('dispositivo_duplicado');

    renderPage();

    expect(
      screen.getByText(/ya tienes una sesión activa/i)
    ).toBeInTheDocument();
  });

  it('should render navigation buttons', () => {
    mockGet.mockReturnValue('inactividad');

    renderPage();

    expect(screen.getByText(/volver a unirse/i)).toBeInTheDocument();
    expect(screen.getByText(/inicio/i)).toBeInTheDocument();
  });
});