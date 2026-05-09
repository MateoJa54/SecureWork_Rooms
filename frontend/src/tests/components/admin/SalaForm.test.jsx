import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SalaForm from '../../../components/admin/SalaForm.jsx';

describe('SalaForm component', () => {

  let mockSubmit;

  beforeEach(() => {
    mockSubmit = vi.fn();
  });

  it('should render form fields', () => {
    render(<SalaForm onSubmit={vi.fn()} loading={false} />);

    expect(
      screen.getByPlaceholderText(/Sala de trabajo/i)
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText(/Mínimo 4 caracteres/i)
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /Crear sala/i })
    ).toBeInTheDocument();
  });

  it('should validate short pin', async () => {
    render(<SalaForm onSubmit={mockSubmit} loading={false} />);

    fireEvent.change(
      screen.getByPlaceholderText(/Sala de trabajo/i),
      {
        target: { value: 'Sala Test' },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText(/mínimo 4 caracteres/i),
      {
        target: { value: '12' },
      }
    );

    fireEvent.click(
      screen.getByRole('button', { name: /crear sala/i })
    );

    await waitFor(() => {
      expect(mockSubmit).not.toHaveBeenCalled();
    });
  });

  it('should submit form', async () => {
    const onSubmit = vi.fn().mockResolvedValue();

    render(<SalaForm onSubmit={onSubmit} loading={false} />);

    fireEvent.change(
      screen.getByPlaceholderText(/Sala de trabajo/i),
      {
        target: { value: 'Nueva Sala' },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText(/Mínimo 4 caracteres/i),
      {
        target: { value: '1234' },
      }
    );

    fireEvent.click(
      screen.getByRole('button', { name: /Crear sala/i })
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: 'Nueva Sala',
        pin: '1234',
      })
    );
  });

  it('should show multimedia field', () => {
    render(<SalaForm onSubmit={vi.fn()} loading={false} />);

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'multimedia' },
    });

    expect(
      screen.getByPlaceholderText(/Ej: 10/i)
    ).toBeInTheDocument();
  });

  it('should show submit error', async () => {
    const mockError = vi.fn().mockRejectedValue(new Error('Error API'));

    render(<SalaForm onSubmit={mockError} />);

    fireEvent.change(
      screen.getByPlaceholderText(/Sala de trabajo/i),
      {
        target: { value: 'Sala Error' },
      }
    );

    fireEvent.change(
      screen.getByPlaceholderText(/mínimo 4 caracteres/i),
      {
        target: { value: '1234' }
      }
    );

    fireEvent.click(
      screen.getByRole('button', { name: /crear sala/i })
    );

    await waitFor(() => {
      expect(mockError).toHaveBeenCalled();
    });
  });

});