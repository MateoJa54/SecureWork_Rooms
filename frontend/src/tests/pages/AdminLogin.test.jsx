import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import AdminLogin from '../../pages/AdminLogin';

const mockNavigate = vi.fn();
const mockLogin = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
  }),
}));

vi.mock('../../components/common/Input.jsx', () => ({
  default: ({ label, id, ...props }) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} {...props} />
    </div>
  ),
}));

vi.mock('../../components/common/Button.jsx', () => ({
  default: ({ children, ...props }) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock('../../components/common/ErrorMessage.jsx', () => ({
  default: ({ message }) =>
    message ? (
      <div>
        {Array.isArray(message)
          ? message.map((m, i) => <p key={i}>{m}</p>)
          : <p>{message}</p>}
      </div>
    ) : null,
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <AdminLogin />
      </AuthProvider>
    </MemoryRouter>
  );

describe('AdminLogin page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form', () => {
    renderPage();

    expect(screen.getByText(/panel de administración/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });

  it('should call login function on valid submit', async () => {
    mockLogin.mockResolvedValueOnce({});

    renderPage();

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'test@test.com' },
    });

    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: '123456' },
    });

    fireEvent.click(screen.getByText(/iniciar sesión/i));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@test.com', '123456');
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard', {
        replace: true,
      });
    });
  });

  it('should show error when login fails', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Credenciales inválidas'));

    renderPage();

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'wrong@test.com' },
    });

    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: 'wrongpass' },
    });

    fireEvent.click(screen.getByText(/iniciar sesión/i));

    expect(
      await screen.findByText(/credenciales inválidas/i)
    ).toBeInTheDocument();
  });

  it('should show validation errors when fields are empty', async () => {
    renderPage();

    fireEvent.click(screen.getByText(/iniciar sesión/i));

    expect(
      await screen.findByText(/correo electrónico es requerido/i)
    ).toBeInTheDocument();

    expect(
      await screen.findByText(/contraseña es requerida/i)
    ).toBeInTheDocument();
  });

  it('should show validation error when only email is missing', async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: '123456' },
    });

    fireEvent.click(screen.getByText(/iniciar sesión/i));

    expect(
      await screen.findByText(/correo electrónico es requerido/i)
    ).toBeInTheDocument();
  });

  it('should show validation error when only password is missing', async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'test@test.com' },
    });

    fireEvent.click(screen.getByText(/iniciar sesión/i));

    expect(
      await screen.findByText(/contraseña es requerida/i)
    ).toBeInTheDocument();
  });

  it('should handle loading state (button exists during submit)', async () => {
    mockLogin.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    renderPage();

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: 'test@test.com' },
    });

    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: '123456' },
    });

    fireEvent.click(screen.getByText(/iniciar sesión/i));

    expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument();
  });
});