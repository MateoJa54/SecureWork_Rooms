import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import UsuariosConectados from '../../../components/admin/UsuariosConectados';

describe('UsuariosConectados component', () => {

  const usuarios = [
    {
      nickname: 'Eduardo',
      ip: '127.0.0.1',
    },
    {
      nickname: 'Carlos',
      ip: '192.168.0.1',
    },
  ];

  it('should render empty state', () => {
    render(
      <UsuariosConectados
        usuarios={[]}
        onExpulsar={vi.fn()}
      />
    );

    expect(
      screen.getByText(/No hay usuarios conectados/i)
    ).toBeInTheDocument();
  });

  it('should render users', () => {
    render(
      <UsuariosConectados
        usuarios={usuarios}
        onExpulsar={vi.fn()}
      />
    );

    expect(screen.getByText('Eduardo')).toBeInTheDocument();
    expect(screen.getByText('Carlos')).toBeInTheDocument();
  });

  it('should render ips', () => {
    render(
      <UsuariosConectados
        usuarios={usuarios}
        onExpulsar={vi.fn()}
      />
    );

    expect(screen.getByText('127.0.0.1')).toBeInTheDocument();
  });

  it('should call onExpulsar', () => {
    const onExpulsar = vi.fn();

    render(
      <UsuariosConectados
        usuarios={usuarios}
        onExpulsar={onExpulsar}
      />
    );

    fireEvent.click(screen.getAllByText(/Expulsar/i)[0]);

    expect(onExpulsar).toHaveBeenCalledWith('Eduardo');
  });

  it('should show loading button', () => {
    render(
      <UsuariosConectados
        usuarios={usuarios}
        onExpulsar={vi.fn()}
        loadingNick="Eduardo"
      />
    );

    expect(screen.getAllByText(/Cargando/i).length >= 0).toBeTruthy();
  });

});