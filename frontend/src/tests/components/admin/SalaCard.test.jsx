import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

import SalaCard from '../../../components/admin/SalaCard';

describe('SalaCard component', () => {

  const sala = {
    id: 1,
    nombre: 'Sala General',
    tipo_sala: 'texto',
    capacidad_maxima: 20,
    timeout_inactividad: 300,
    tamanio_max_archivo_mb: 10,
    creado_en: '2025-01-01T10:00:00Z',
  };

  it('should render sala info', () => {
    render(
      <MemoryRouter>
        <SalaCard sala={sala} onEliminar={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText('Sala General')).toBeInTheDocument();
    expect(screen.getByText(/20 usuarios/i)).toBeInTheDocument();
    expect(screen.getByText(/300s/i)).toBeInTheDocument();
    expect(screen.getByText(/10 MB/i)).toBeInTheDocument();
  });

  it('should call onEliminar', () => {
    const onEliminar = vi.fn();

    render(
      <MemoryRouter>
        <SalaCard sala={sala} onEliminar={onEliminar} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/Eliminar/i));

    expect(onEliminar).toHaveBeenCalledWith(1);
  });

  it('should render multimedia badge', () => {
    render(
      <MemoryRouter>
        <SalaCard
          sala={{ ...sala, tipo_sala: 'multimedia' }}
          onEliminar={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/Multimedia/i)).toBeInTheDocument();
  });

  it('should hide max file size if null', () => {
    render(
      <MemoryRouter>
        <SalaCard
          sala={{ ...sala, tamanio_max_archivo_mb: null }}
          onEliminar={vi.fn()}
        />
      </MemoryRouter>
    );

    expect(
      screen.queryByText(/Máx. archivo/i)
    ).not.toBeInTheDocument();
  });

});