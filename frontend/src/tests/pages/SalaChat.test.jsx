import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import SalaChat from '../../pages/SalaChat.jsx';

/* =========================
   MOCKS
========================= */

// router
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '1' })
  };
});

// socket hook
const emitMock = vi.fn();
const onMock = vi.fn();
const offMock = vi.fn();
const disconnectMock = vi.fn();

vi.mock('../../hooks/useSocket.js', () => ({
  useSocket: () => ({
    connect: vi.fn(() => ({
      on: onMock,
      emit: emitMock,
      off: offMock
    })),
    disconnect: disconnectMock
  })
}));

// device service
vi.mock('../../services/device.service.js', () => ({
  getSessionToken: () => 'token',
  getSalaId: () => '1',
  getNickname: () => 'Eduardo',
  clearSession: vi.fn()
}));

// componentes hijos (simplificados)
vi.mock('../../components/chat/MessageList.jsx', () => ({
  default: ({ mensajes }) => (
    <div data-testid="message-list">
      {mensajes.map((m, i) => (
        <p key={i}>{m.contenido}</p>
      ))}
    </div>
  )
}));

vi.mock('../../components/chat/MessageInput.jsx', () => ({
  default: ({ onSend }) => (
    <button
      data-testid="send-btn"
      onClick={() => onSend('hola')}
    >
      Send
    </button>
  )
}));

vi.mock('../../components/chat/UserSidebar.jsx', () => ({
  default: ({ usuarios }) => (
    <div data-testid="users">
      {usuarios.map((u, i) => (
        <p key={i}>{u.nickname}</p>
      ))}
    </div>
  )
}));

vi.mock('../../components/chat/FileUpload.jsx', () => ({
  default: () => <div data-testid="file-upload" />
}));

/* =========================
   TESTS
========================= */

describe('SalaChat page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = () =>
    render(
      <MemoryRouter>
        <SalaChat />
      </MemoryRouter>
    );

  test('should render header and default UI', () => {
    renderPage();

    expect(screen.getByText('Sala')).toBeInTheDocument();
    expect(screen.getByTestId('message-list')).toBeInTheDocument();
    expect(screen.getByTestId('users')).toBeInTheDocument();
  });

  test('should connect socket on mount', () => {
    renderPage();

    const connectCall = onMock.mock.calls.find(
      (c) => c[0] === 'connect'
    );

    expect(connectCall).toBeDefined();
  });

  test('should send message via socket', async () => {
    renderPage();

    const sendBtn = screen.getByTestId('send-btn');
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(emitMock).toHaveBeenCalledWith(
        'mensaje:enviar',
        expect.objectContaining({
          sala_id: '1',
          contenido: 'hola'
        })
      );
    });
  });

  test('should render messages and users when socket emits data', async () => {
    renderPage();

    const joinedHandler = onMock.mock.calls.find(
      (c) => c[0] === 'sala:joined'
    )?.[1];

    expect(joinedHandler).toBeDefined();

    // simular evento socket
    joinedHandler({
      sala: { nombre: 'Sala Test', tipo_sala: 'normal' },
      usuarios: [{ nickname: 'Juan' }],
      mensajes_recientes: [{ contenido: 'Hola mundo' }]
    });

    expect(await screen.findByText('Sala Test')).toBeInTheDocument();
    expect(screen.getByText('Juan')).toBeInTheDocument();
    expect(screen.getByText('Hola mundo')).toBeInTheDocument();
  });

  test('should navigate if session is invalid', async () => {
  vi.resetModules();

  vi.doMock('../../services/device.service.js', () => ({
    getSessionToken: () => null,
    getSalaId: () => '999',
    getNickname: () => 'Eduardo',
    clearSession: vi.fn()
  }));

  const { default: SalaChat } = await import('../../pages/SalaChat.jsx');

  render(
    <MemoryRouter>
      <SalaChat />
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith('/unirse', {
      replace: true
    });
  });
});
});