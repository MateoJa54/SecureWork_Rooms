import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../../../utils/formatters.js', () => ({
  formatHora: vi.fn(() => '10:30'),
}));

import MessageList from '../../../components/chat/MessageList.jsx';

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});


describe('MessageList component', () => {
  const mensajes = [
    {
      id: 1,
      nickname: 'Eduardo',
      contenido: 'Hola mundo',
      enviado_en: '2025-01-01',
    },
    {
      id: 2,
      nickname: 'Carlos',
      contenido: 'Hola bro',
      enviado_en: '2025-01-01',
    },
  ];

  it('should render empty state', () => {
    render(
      <MessageList
        mensajes={[]}
        nicknameSelf="Eduardo"
      />
    );

    expect(
      screen.getByText(/No hay mensajes aún/i)
    ).toBeInTheDocument();
  });

  it('should render all messages', () => {
    render(
      <MessageList
        mensajes={mensajes}
        nicknameSelf="Eduardo"
      />
    );

    expect(screen.getByText('Hola mundo')).toBeInTheDocument();
    expect(screen.getByText('Hola bro')).toBeInTheDocument();
  });

  it('should hide own nickname', () => {
    render(
      <MessageList
        mensajes={mensajes}
        nicknameSelf="Eduardo"
      />
    );

    expect(screen.queryByText(/^Eduardo$/)).not.toBeInTheDocument();
  });

  it('should show other users nickname', () => {
    render(
      <MessageList
        mensajes={mensajes}
        nicknameSelf="Eduardo"
      />
    );

    expect(screen.getByText('Carlos')).toBeInTheDocument();
  });

  it('should render formatted hour', () => {
    render(
      <MessageList
        mensajes={mensajes}
        nicknameSelf="Eduardo"
      />
    );

    const horas = screen.getAllByText('10:30');

    expect(horas.length).toBeGreaterThan(0);
  });
});