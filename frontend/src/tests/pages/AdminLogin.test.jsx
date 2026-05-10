import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import AdminLogin from '../../pages/AdminLogin';

// mocks
const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: () => ({
    login: mockLogin,
    user: null,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Navigate: ({ to }) => <div>Redirect to {to}</div>,
  };
});

describe('AdminLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>
    );

  const submitForm = () => {
    fireEvent.click(
      screen.getByRole('button', { name: /iniciar sesion/i })
    );
  };

  test('renderiza formulario', () => {
    renderComponent();

    expect(screen.getByText(/Panel de administracion/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo electronico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
  });

  test('muestra error si password es corta', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/Correo electronico/i), {
      target: { value: 'test@mail.com' },
    });

    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: '123' },
    });

    submitForm();

    expect(
      await screen.findByText(/La contrasena debe tener al menos 6 caracteres/i)
    ).toBeInTheDocument();
  });

  test('login exitoso llama navigate', async () => {
    mockLogin.mockResolvedValueOnce();

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Correo electronico/i), {
      target: { value: 'test@mail.com' },
    });

    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: '123456' },
    });

    submitForm();

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard', {
        replace: true,
      });
    });
  });

  test('maneja error de login', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Error de autenticacion'));

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Correo electronico/i), {
      target: { value: 'test@mail.com' },
    });

    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: '123456' },
    });

    submitForm();

    expect(
      await screen.findByText(/Error de autenticacion/i)
    ).toBeInTheDocument();
  });
});