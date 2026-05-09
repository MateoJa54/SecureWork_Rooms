import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('../../../services/salas.service.js', () => ({
  subirArchivo: vi.fn(),
}));

vi.mock('../../../utils/formatters.js', () => ({
  formatBytes: vi.fn(() => '1 MB'),
}));

import { subirArchivo } from '../../../services/salas.service.js';
import FileUpload from '../../../components/chat/FileUpload.jsx';

describe('FileUpload component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render upload button', () => {
    render(
      <FileUpload
        salaId="1"
        sessionToken="token"
      />
    );

    expect(screen.getByTitle(/Subir archivo/i)).toBeInTheDocument();
  });

  it('should reject invalid file type', async () => {
    render(
      <FileUpload
        salaId="1"
        sessionToken="token"
      />
    );

    const input = document.querySelector('input[type="file"]');

    const file = new File(['test'], 'test.exe', {
      type: 'application/exe',
    });

    fireEvent.change(input, {
      target: { files: [file] },
    });

    expect(
      await screen.findByText(/Tipo de archivo no permitido/i)
    ).toBeInTheDocument();
  });

  it('should reject file larger than limit', async () => {
    render(
      <FileUpload
        salaId="1"
        sessionToken="token"
        maxMb={1}
      />
    );

    const input = document.querySelector('input[type="file"]');

    const file = new File(
      [new ArrayBuffer(2 * 1024 * 1024)],
      'big.pdf',
      { type: 'application/pdf' }
    );

    fireEvent.change(input, {
      target: { files: [file] },
    });

    expect(
      await screen.findByText(/supera el límite/i)
    ).toBeInTheDocument();
  });

  it('should upload valid file', async () => {
    subirArchivo.mockResolvedValue({
      ok: true,
    });

    const onUploaded = vi.fn();

    render(
      <FileUpload
        salaId="1"
        sessionToken="token"
        onUploaded={onUploaded}
      />
    );

    const input = document.querySelector('input[type="file"]');

    const file = new File(['hola'], 'test.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(input, {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(subirArchivo).toHaveBeenCalled();
    });

    expect(onUploaded).toHaveBeenCalled();
  });

  it('should handle upload error', async () => {
    subirArchivo.mockRejectedValue(
      new Error('Error upload')
    );

    render(
      <FileUpload
        salaId="1"
        sessionToken="token"
      />
    );

    const input = document.querySelector('input[type="file"]');

    const file = new File(['hola'], 'test.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(input, {
      target: { files: [file] },
    });

    expect(
      await screen.findByText(/Error upload/i)
    ).toBeInTheDocument();
  });
});