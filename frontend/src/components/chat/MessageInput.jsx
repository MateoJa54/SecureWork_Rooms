import { useState } from 'react';

const MAX_CHARS = 2000;

export default function MessageInput({ onSend, disabled }) {
  const [texto, setTexto] = useState('');

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    const trimmed = texto.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setTexto('');
  }

  return (
    <div className="border-t border-gray-200 bg-white p-3 flex gap-2 items-end">
      <textarea
        className="flex-1 input-field resize-none min-h-[40px] max-h-32"
        placeholder="Escribe un mensaje… (Enter para enviar)"
        value={texto}
        maxLength={MAX_CHARS}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
      />
      <button
        onClick={submit}
        disabled={!texto.trim() || disabled}
        className="btn-primary px-4 py-2 shrink-0"
      >
        Enviar
      </button>
    </div>
  );
}
