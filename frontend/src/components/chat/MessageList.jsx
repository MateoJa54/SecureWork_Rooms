import { useEffect, useRef } from 'react';
import { formatHora } from '../../utils/formatters.js';

export default function MessageList({ mensajes, nicknameSelf }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  if (!mensajes.length) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        No hay mensajes aún. ¡Di hola!
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {mensajes.map((msg, i) => {
        const esMio = msg.nickname === nicknameSelf;
        return (
          <div key={msg.id ?? i} className={`flex flex-col ${esMio ? 'items-end' : 'items-start'}`}>
            {!esMio && (
              <span className="text-xs text-gray-500 mb-1 ml-1">{msg.nickname}</span>
            )}
            <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-2xl text-sm ${esMio ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'}`}>
              {msg.contenido}
            </div>
            <span className="text-xs text-gray-400 mt-1">{formatHora(msg.enviado_en)}</span>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
