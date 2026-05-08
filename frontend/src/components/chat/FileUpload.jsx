import { useRef, useState } from 'react';
import { subirArchivo } from '../../services/salas.service.js';
import { formatBytes } from '../../utils/formatters.js';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/markdown',
]);

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'txt', 'md']);
const DEFAULT_MAX_MB = 10;

function getFileExtension(fileName) {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

export default function FileUpload({ salaId, sessionToken, maxMb = DEFAULT_MAX_MB, onUploaded, disabled = false }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  function clearInput() {
    if (inputRef.current) inputRef.current.value = '';
  }

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    const extension = getFileExtension(file.name);
    if (!ALLOWED_MIME.has(file.type) || !ALLOWED_EXTENSIONS.has(extension)) {
      setError('Tipo no permitido. Usa imagen, PDF, TXT o MD.');
      clearInput();
      return;
    }

    const maxBytes = maxMb * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`Maximo ${formatBytes(maxBytes)} por archivo.`);
      clearInput();
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
      clearInput();
    }
  }

  return (
    <div className="relative flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleFile}
        accept={Array.from(ALLOWED_EXTENSIONS).map((ext) => `.${ext}`).join(',')}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading || disabled}
        className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
        title={uploading ? 'Subiendo archivo' : 'Subir archivo'}
      >
        {uploading ? (
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M12 3a9 9 0 0 1 9 9h-3a6 6 0 0 0-6-6V3Z" />
          </svg>
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="m7.5 12.5 5.6-5.6a3 3 0 1 1 4.24 4.24l-6.7 6.7a4.5 4.5 0 0 1-6.36-6.36l6.7-6.7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      {error && (
        <span className="absolute right-0 top-12 z-10 w-56 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 shadow-lg">
          {error}
        </span>
      )}
    </div>
  );
}
