import { useRef, useState } from 'react';
import { subirArchivo } from '../../services/salas.service.js';
import { formatBytes } from '../../utils/formatters.js';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'];

export default function FileUpload({ salaId, sessionToken, maxMb, onUploaded }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    if (!ALLOWED_MIME.includes(file.type)) {
      setError('Tipo de archivo no permitido');
      return;
    }
    if (maxMb && file.size > maxMb * 1024 * 1024) {
      setError(`El archivo supera el límite de ${maxMb} MB`);
      return;
    }

    setUploading(true);
    try {
      const result = await subirArchivo(salaId, file, sessionToken);
      onUploaded?.(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input ref={inputRef} type="file" className="hidden" onChange={handleFile} accept={ALLOWED_MIME.join(',')} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="text-gray-500 hover:text-primary-600 disabled:opacity-50"
        title="Subir archivo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      </button>
      {uploading && <span className="text-xs text-gray-400">Subiendo…</span>}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
