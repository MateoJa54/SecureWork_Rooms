import Button from '../common/Button.jsx';

function UserIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20a7.5 7.5 0 0 1 15 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function UsuariosConectados({ usuarios, onExpulsar, loadingNick }) {
  if (!usuarios?.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
        <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-400">
          <UserIcon />
        </div>
        <p className="mt-2 text-sm font-medium text-slate-600">No hay usuarios conectados</p>
        <p className="mt-1 text-xs text-slate-400">Cuando alguien entre a la sala aparecera aqui.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {usuarios.map((u) => (
        <li key={u.nickname} className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-700">
              {(u.nickname || '?').slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{u.nickname}</p>
              <p className="truncate text-xs text-slate-400">{u.ip || 'Sesion activa'}</p>
            </div>
          </div>
          <Button
            variant="danger"
            className="w-full shrink-0 text-xs py-1.5 px-3 sm:w-auto"
            loading={loadingNick === u.nickname}
            onClick={() => onExpulsar(u.nickname)}
          >
            Expulsar
          </Button>
        </li>
      ))}
    </ul>
  );
}
