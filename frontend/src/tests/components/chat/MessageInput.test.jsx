import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MessageInput from '../../../components/chat/MessageInput.jsx';

describe('MessageInput component', () => {
  it('should render textarea and button', () => {
    render(<MessageInput onSend={vi.fn()} />);

    expect(screen.getByPlaceholderText(/Escribe un mensaje/i)).toBeInTheDocument();
    expect(screen.getByText('Enviar')).toBeInTheDocument();
  });

  it('should send message when clicking button', () => {
    const onSend = vi.fn();

    render(<MessageInput onSend={onSend} />);

    const textarea = screen.getByPlaceholderText(/Escribe un mensaje/i);
    const button = screen.getByText('Enviar');

    fireEvent.change(textarea, {
      target: { value: 'Hola mundo' },
    });

    fireEvent.click(button);

    expect(onSend).toHaveBeenCalledWith('Hola mundo');
  });

  it('should clear textarea after sending', () => {
    const onSend = vi.fn();

    render(<MessageInput onSend={onSend} />);

    const textarea = screen.getByPlaceholderText(/Escribe un mensaje/i);

    fireEvent.change(textarea, {
      target: { value: 'Mensaje' },
    });

    fireEvent.click(screen.getByText('Enviar'));

    expect(textarea.value).toBe('');
  });

  it('should send message with Enter key', () => {
    const onSend = vi.fn();

    render(<MessageInput onSend={onSend} />);

    const textarea = screen.getByPlaceholderText(/Escribe un mensaje/i);

    fireEvent.change(textarea, {
      target: { value: 'Hola Enter' },
    });

    fireEvent.keyDown(textarea, {
      key: 'Enter',
      code: 'Enter',
      charCode: 13,
    });

    expect(onSend).toHaveBeenCalledWith('Hola Enter');
  });

  it('should not send message with Shift + Enter', () => {
    const onSend = vi.fn();

    render(<MessageInput onSend={onSend} />);

    const textarea = screen.getByPlaceholderText(/Escribe un mensaje/i);

    fireEvent.change(textarea, {
      target: { value: 'Hola' },
    });

    fireEvent.keyDown(textarea, {
      key: 'Enter',
      shiftKey: true,
    });

    expect(onSend).not.toHaveBeenCalled();
  });

  it('should not send empty messages', () => {
    const onSend = vi.fn();

    render(<MessageInput onSend={onSend} />);

    fireEvent.click(screen.getByText('Enviar'));

    expect(onSend).not.toHaveBeenCalled();
  });

  it('should disable textarea and button', () => {
    render(<MessageInput onSend={vi.fn()} disabled />);

    const textarea = screen.getByPlaceholderText(/Escribe un mensaje/i);
    const button = screen.getByText('Enviar');

    expect(textarea).toBeDisabled();
    expect(button).toBeDisabled();
  });
});