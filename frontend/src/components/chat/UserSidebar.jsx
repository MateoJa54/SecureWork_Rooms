export default function UserSidebar({ usuarios, nicknameSelf, className = '', onClose }) {
  return (
    <aside className={`flex w-72 shrink-0 flex-col border-l border-slate-100 bg-white ${className}`}>
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5">
        <div>
          <p className="text-xs font-semibold uppercase text-primary-600">Usuarios</p>
          <h2 className="mt-1 text-xl font-bold text-slate-950">Conectados</h2>
          <p className="mt-1 text-sm text-slate-500">{usuarios.length} en la sala</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            title="Cerrar usuarios"
            aria-label="Cerrar usuarios"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      <ul className="flex-1 space-y-2 overflow-y-auto p-4">
        {usuarios.map((u) => {
          const esYo = u.nickname === nicknameSelf;
          return (
            <li
              key={u.nickname}
              className={`flex items-center gap-3 rounded-2xl px-3 py-3 ${esYo ? 'bg-primary-50 ring-1 ring-primary-100' : 'hover:bg-slate-50'}`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${esYo ? 'bg-primary-600 text-white' : 'bg-sky-100 text-sky-700'}`}>
                {u.nickname.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-sm ${esYo ? 'font-bold text-primary-700' : 'font-semibold text-slate-700'}`}>
                  {u.nickname}
                </p>
                <p className="text-xs text-slate-400">{esYo ? 'Tu sesion' : 'Activo ahora'}</p>
              </div>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-50" />
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
