import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

import App from '../App.jsx';

// Mock pages
vi.mock('../pages/Landing.jsx', () => ({
  default: () => <div>Landing Page</div>,
}));

vi.mock('../pages/AdminLogin.jsx', () => ({
  default: () => <div>Admin Login</div>,
}));

vi.mock('../pages/AdminDashboard.jsx', () => ({
  default: () => <div>Admin Dashboard</div>,
}));

vi.mock('../pages/CrearSala.jsx', () => ({
  default: () => <div>Crear Sala</div>,
}));

vi.mock('../pages/DetalleSala.jsx', () => ({
  default: () => <div>Detalle Sala</div>,
}));

vi.mock('../pages/UnirseSala.jsx', () => ({
  default: () => <div>Unirse Sala</div>,
}));

vi.mock('../pages/SalaChat.jsx', () => ({
  default: () => <div>Sala Chat</div>,
}));

vi.mock('../pages/ErrorPage.jsx', () => ({
  default: () => <div>Error Page</div>,
}));

// Mock ProtectedRoute
vi.mock('../components/common/ProtectedRoute.jsx', () => ({
  default: ({ children }) => <div>{children}</div>,
}));

// Mock providers
vi.mock('../context/AuthContext.jsx', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
}));

vi.mock('../context/SocketContext.jsx', () => ({
  SocketProvider: ({ children }) => <div>{children}</div>,
}));

describe('App.jsx', () => {
  test('renderiza landing page por defecto', () => {
    window.history.pushState({}, '', '/');

    render(<App />);

    expect(screen.getByText(/Landing Page/i)).toBeInTheDocument();
  });

  test('renderiza admin login', () => {
    window.history.pushState({}, '', '/admin/login');

    render(<App />);

    expect(screen.getByText(/Admin Login/i)).toBeInTheDocument();
  });

  test('renderiza dashboard protegido', () => {
    window.history.pushState({}, '', '/admin/dashboard');

    render(<App />);

    expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
  });

  test('renderiza crear sala', () => {
    window.history.pushState({}, '', '/admin/salas/nueva');

    render(<App />);

    expect(screen.getByText(/Crear Sala/i)).toBeInTheDocument();
  });

  test('renderiza detalle sala', () => {
    window.history.pushState({}, '', '/admin/salas/123');

    render(<App />);

    expect(screen.getByText(/Detalle Sala/i)).toBeInTheDocument();
  });

  test('renderiza unirse sala', () => {
    window.history.pushState({}, '', '/unirse');

    render(<App />);

    expect(screen.getByText(/Unirse Sala/i)).toBeInTheDocument();
  });

  test('renderiza sala chat', () => {
    window.history.pushState({}, '', '/sala/123');

    render(<App />);

    expect(screen.getByText(/Sala Chat/i)).toBeInTheDocument();
  });

  test('renderiza error page', () => {
    window.history.pushState({}, '', '/error');

    render(<App />);

    expect(screen.getByText(/Error Page/i)).toBeInTheDocument();
  });

  test('redirige rutas desconocidas a error', () => {
    window.history.pushState({}, '', '/ruta-falsa');

    render(<App />);

    expect(screen.getByText(/Error Page/i)).toBeInTheDocument();
  });
});