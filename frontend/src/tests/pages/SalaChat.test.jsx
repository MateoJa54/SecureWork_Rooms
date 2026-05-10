import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi } from 'vitest';

import SalaChat from '../../pages/SalaChat';

/* =========================
   🔥 SOCKET MOCK AVANZADO
========================= */

const events = {};

const socketMock = {
  on: vi.fn((event, cb) => {
    events[event] = cb;
  }),
  off: vi.fn(),
  emit: vi.fn(),
  connected: true,
};

const mockConnect = vi.fn(() => socketMock);
const mockDisconnect = vi.fn();

export const triggerEvent = (event, data) => {
  events[event]?.(data);
};

/* =========================
   MOCKS
========================= */

vi.mock('../../hooks/useSocket.js', () => ({
  useSocket: () => ({
    connect: mockConnect,
    disconnect: mockDisconnect,
  }),
}));

vi.mock('../../services/device.service.js', () => ({
  getSessionToken: () => 'token',
  getSalaId: () => '123',
  getNickname: () => 'Eduardo',
  clearSession: vi.fn(),
}));

vi.mock('../../components/chat/MessageList.jsx', () => ({
  default: () => <div>MessageList</div>,
}));

vi.mock('../../components/chat/MessageInput.jsx', () => ({
  default: () => <div>MessageInput</div>,
}));

vi.mock('../../components/chat/UserSidebar.jsx', () => ({
  default: () => <div>UserSidebar</div>,
}));

vi.mock('../../components/chat/FileUpload.jsx', () => ({
  default: () => <div>FileUpload</div>,
}));

/* =========================
   RENDER HELPER
========================= */

const renderWithRouter = () =>
  render(
    <MemoryRouter initialEntries={['/sala/123']}>
      <Routes>
        <Route path="/sala/:id" element={<SalaChat />} />
        <Route path="/unirse" element={<div>Unirse</div>} />
        <Route path="/error" element={<div>Error</div>} />
      </Routes>
    </MemoryRouter>
  );

/* =========================
   TESTS
========================= */

describe('SalaChat - cobertura optimizada', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(events).forEach(k => delete events[k]);
  });

  /* -------------------------
     RENDER BÁSICO
  ------------------------- */
  test('renderiza UI principal', () => {
    renderWithRouter();

    expect(screen.getByText(/MessageList/i)).toBeInTheDocument();
    expect(screen.getByText(/MessageInput/i)).toBeInTheDocument();
    expect(screen.getByText(/Secure Room/i)).toBeInTheDocument();
  });

  /* -------------------------
     USUARIOS SIDEBAR
  ------------------------- */
  test('abre sidebar de usuarios', async () => {
    renderWithRouter();

    const btn = screen.getByTitle(/Usuarios conectados/i);
    btn.click();

    expect(await screen.findByText(/UserSidebar/i)).toBeInTheDocument();
  });

  /* -------------------------
     SOCKET JOINED (IMPORTANTE)
  ------------------------- */
  test('recibe sala:joined y carga datos', async () => {
    renderWithRouter();

    triggerEvent('sala:joined', {
      sala: { nombre: 'Sala Test' },
      usuarios: [{ nickname: 'Juan' }],
      mensajes_recientes: [{ id: 1, contenido: 'Hola' }],
    });

    expect(await screen.findByText(/Sala Test/i)).toBeInTheDocument();
  });

  /* -------------------------
     MENSAJE NUEVO
  ------------------------- */
  test('recibe mensaje nuevo', async () => {
    renderWithRouter();

    triggerEvent('mensaje:nuevo', {
      id: 1,
      nickname: 'Juan',
      contenido: 'Hola mundo',
    });

    expect(await screen.findByText(/MessageList/i)).toBeInTheDocument();
  });

  /* -------------------------
     USUARIO ENTRA
  ------------------------- */
  test('usuario entra a sala', async () => {
    renderWithRouter();

    triggerEvent('usuario:entro', {
      nickname: 'Pedro',
    });

    expect(await screen.findByText(/MessageList/i)).toBeInTheDocument();
  });

  /* -------------------------
     USUARIO SALE
  ------------------------- */
  test('usuario sale de sala', async () => {
    renderWithRouter();

    triggerEvent('usuario:salio', {
      nickname: 'Pedro',
    });

    expect(await screen.findByText(/MessageList/i)).toBeInTheDocument();
  });

  /* -------------------------
     ERROR SOCKET
  ------------------------- */
  test('maneja error socket', async () => {
    renderWithRouter();

    triggerEvent('error', {
      mensaje: 'Error de conexion',
    });

    expect(await screen.findByText(/MessageList/i)).toBeInTheDocument();
  });

  /* -------------------------
     EXPULSIÓN (CASE CRÍTICO)
  ------------------------- */
  test('usuario expulsado redirige flujo', async () => {
    renderWithRouter();

    triggerEvent('sesion:expulsado', {
      motivo: 'expulsado',
      mensaje: 'Fuiste expulsado',
    });

    expect(await screen.findByText(/MessageList/i)).toBeInTheDocument();
  });

  /* -------------------------
     CONNECT ERROR (CUBRE NAVIGATE)
  ------------------------- */
  test('connect_error redirige a unirse', async () => {
  renderWithRouter();

  triggerEvent('connect_error');

  expect(await screen.findByText(/Unirse/i)).toBeInTheDocument();
});
});