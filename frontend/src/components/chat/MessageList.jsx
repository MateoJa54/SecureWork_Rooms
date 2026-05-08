import { useEffect, useRef } from 'react';
import { formatHora } from '../../utils/formatters.js';

export default function MessageList({ mensajes, nicknameSelf, typingUsers = [] }) {
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
        <p className="mt-1 text-sm text-slate-400">Escribe el primer mensaje para iniciar la conversacion.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 py-6">
      <div className="mx-auto flex max-w-4xl flex-col gap-4">
        {mensajes.map((msg, i) => {
          const esMio = msg.nickname === nicknameSelf;
          return (
            <div key={msg.id ?? i} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[78%] gap-3 ${esMio ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`mt-6 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${esMio ? 'bg-primary-100 text-primary-700' : 'bg-sky-100 text-sky-700'}`}>
                  {(msg.nickname || '?').slice(0, 1).toUpperCase()}
                </div>
                <div className={`flex flex-col ${esMio ? 'items-end' : 'items-start'}`}>
                  {!esMio && (
                    <span className="mb-1 text-xs font-semibold text-slate-500">{msg.nickname}</span>
                  )}
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${esMio ? 'rounded-br-md bg-gradient-to-r from-primary-700 to-sky-500 text-white shadow-primary-600/20' : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'}`}>
                    {msg.contenido}
                  </div>
                  <span className="mt-1 text-xs text-slate-400">{formatHora(msg.enviado_en)}</span>
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
