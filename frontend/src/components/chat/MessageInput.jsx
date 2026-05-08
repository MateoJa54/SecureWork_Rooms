import { useRef, useState } from 'react';

const MAX_CHARS = 2000;
const TYPING_THROTTLE_MS = 1500;

export default function MessageInput({ onSend, onTyping, disabled, attachment }) {
  const [texto, setTexto] = useState('');
  const lastTypingRef = useRef(0);

  function notifyTyping() {
    const now = Date.now();
    if (now - lastTypingRef.current < TYPING_THROTTLE_MS) return;
    lastTypingRef.current = now;
    onTyping?.();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function handleChange(e) {
    setTexto(e.target.value);
    if (e.target.value.trim()) notifyTyping();
  }

  function submit() {
    const trimmed = texto.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setTexto('');
  }

  return (
    <div className="border-t border-slate-100 bg-white px-4 py-3">
      <div className="flex items-end gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm focus-within:border-primary-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary-50">
        {attachment && (
          <div className="flex h-11 shrink-0 items-center">
            {attachment}
          </div>
        )}
        <textarea
          className="min-h-[42px] max-h-32 flex-1 resize-none border-0 bg-transparent px-1 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0"
          placeholder="Escribe un mensaje... Enter para enviar"
          value={texto}
          maxLength={MAX_CHARS}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
        />
        <button
          onClick={submit}
          disabled={!texto.trim() || disabled}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-primary-700 to-sky-500 text-white shadow-lg shadow-primary-600/25 transition hover:from-primary-800 hover:to-sky-600 disabled:cursor-not-allowed disabled:opacity-40"
          title="Enviar mensaje"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12h13M13 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
