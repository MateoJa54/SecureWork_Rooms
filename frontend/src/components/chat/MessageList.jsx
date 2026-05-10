import { useEffect, useRef, useState } from 'react';
import { obtenerArchivoBlob } from '../../services/salas.service.js';
import { formatBytes, formatHora } from '../../utils/formatters.js';

function isImage(mime = '') {
  return mime.startsWith('image/');
}

function getArchivoNombre(archivo) {
  return archivo?.nombre ?? archivo?.nombre_original ?? 'archivo';
}

function getArchivoMime(archivo) {
  return archivo?.mime ?? archivo?.mime_type ?? '';
}

function getArchivoSize(archivo) {
  return archivo?.size ?? archivo?.tamanio_bytes ?? 0;
}

function FileAttachment({ archivo, sessionToken, mine }) {
  const [objectUrl, setObjectUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mime = getArchivoMime(archivo);
  const name = getArchivoNombre(archivo);
  const size = getArchivoSize(archivo);

  useEffect(() => {
    let alive = true;
    let url = '';

    async function loadFile() {
      setLoading(true);
      setError('');
      try {
        const blob = await obtenerArchivoBlob(archivo.id, sessionToken);
        if (!alive) return;
        url = URL.createObjectURL(blob);
        setObjectUrl(url);
      } catch (err) {
        if (alive) setError(err.message);
      } finally {
        if (alive) setLoading(false);
      }
    }

    if (archivo?.id && sessionToken) loadFile();

    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [archivo?.id, sessionToken]);

  if (loading) {
    return (
      <div className={`mt-2 rounded-2xl px-4 py-3 text-sm ${mine ? 'border border-primary-100 bg-primary-50 text-slate-600' : 'bg-slate-50 text-slate-500'}`}>
        Cargando archivo...
      </div>
    );
  }

  if (error || !objectUrl) {
    return (
      <div className="mt-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
        No se pudo cargar el archivo.
      </div>
    );
  }

  if (isImage(mime)) {
    return (
      <a href={objectUrl} target="_blank" rel="noreferrer" className="mt-2 block overflow-hidden rounded-2xl">
        <img src={objectUrl} alt={name} className="max-h-72 w-full max-w-[min(22rem,72vw)] object-cover" />
      </a>
    );
  }

  return (
    <a
      href={objectUrl}
      download={name}
      target="_blank"
      rel="noreferrer"
      className={`mt-2 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${mine ? 'border border-primary-100 bg-primary-50 text-slate-800 hover:bg-primary-100' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${mine ? 'bg-white text-primary-700' : 'bg-primary-50 text-primary-700'}`}>
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 3h7l4 4v14H7V3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M14 3v5h4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="min-w-0">
        <span className="block truncate font-semibold">{name}</span>
        <span className={`block text-xs ${mine ? 'text-slate-500' : 'text-slate-400'}`}>{formatBytes(Number(size))}</span>
      </span>
    </a>
  );
}

export default function MessageList({ mensajes, nicknameSelf, typingUsers = [], sessionToken }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, typingUsers]);

  if (!mensajes.length) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 ring-1 ring-primary-100">
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 6.5h14M5 11.5h9M5 16.5h6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-700">No hay mensajes aun</p>
        <p className="mt-1 text-sm text-slate-400">Escribe o comparte un archivo para iniciar la conversacion.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:gap-4">
        {mensajes.map((msg, i) => {
          if (msg.tipo === 'sistema') {
            return (
              <div key={msg.id ?? i} className="flex justify-center">
                <div className="rounded-full bg-slate-200/70 px-3 py-1 text-xs font-medium text-slate-500">
                  {msg.contenido}
                </div>
              </div>
            );
          }

          const esMio = msg.nickname === nicknameSelf;
          const hasText = Boolean(msg.contenido);
          const hasFile = Boolean(msg.archivo);

          return (
            <div key={msg.id ?? msg.archivo?.id ?? i} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[88%] gap-2 sm:max-w-[78%] sm:gap-3 ${esMio ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`mt-6 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold sm:h-9 sm:w-9 sm:text-sm ${esMio ? 'bg-primary-100 text-primary-700' : 'bg-sky-100 text-sky-700'}`}>
                  {(msg.nickname || '?').slice(0, 1).toUpperCase()}
                </div>
                <div className={`flex flex-col ${esMio ? 'items-end' : 'items-start'}`}>
                  {!esMio && (
                    <span className="mb-1 text-xs font-semibold text-slate-500">{msg.nickname}</span>
                  )}
                  {hasText && (
                    <div className={`break-words rounded-2xl px-3 py-2.5 text-sm leading-6 shadow-sm sm:px-4 sm:py-3 ${esMio ? 'rounded-br-md bg-gradient-to-r from-primary-700 to-sky-500 text-white shadow-primary-600/20' : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'}`}>
                      {msg.contenido}
                    </div>
                  )}
                  {hasFile && (
                    <div className={hasText ? 'w-full' : ''}>
                      <FileAttachment archivo={msg.archivo} sessionToken={sessionToken} mine={esMio} />
                    </div>
                  )}
                  <span className="mt-1 text-xs text-slate-400">{formatHora(msg.enviado_en ?? msg.archivo?.subido_en)}</span>
                </div>
              </div>
            </div>
          );
        })}

        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-500 shadow-sm">
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'esta escribiendo' : 'estan escribiendo'}...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
