import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  formatFecha,
  formatTipoSala,
  getFechaCreacion,
  getMaxArchivoMb,
  getTimeoutMinutos,
  getTipoSala,
  isSalaMultimedia,
} from '../../utils/formatters.js';
import Button from '../common/Button.jsx';

function Icon({ type, className = 'h-4 w-4' }) {
  const paths = {
    text: 'M5 7h14M5 12h10M5 17h7',
    file: 'M7 3h7l4 4v14H7V3ZM14 3v5h4',
    users: 'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.5 19a4.5 4.5 0 0 1 9 0M16 10a2.5 2.5 0 1 0 0-5',
    clock: 'M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    copy: 'M8 8h10v12H8V8ZM6 16H4V4h10v2',
    arrow: 'M5 12h13M13 6l6 6-6 6',
  };

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={paths[type]} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SalaCard({ sala, onEliminar }) {
  const [copied, setCopied] = useState(false);
  const tipo = getTipoSala(sala);
  const multimedia = isSalaMultimedia(sala);
  const maxArchivoMb = getMaxArchivoMb(sala);
  const usuariosConectados = sala.usuarios_conectados ?? sala.sesiones?.length ?? 0;
  const theme = multimedia
    ? {
        shell: 'border-emerald-100 bg-emerald-50/50',
        icon: 'bg-emerald-600 text-white shadow-emerald-600/25',
        badge: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
        accent: 'from-emerald-500 to-teal-500',
        detail: 'text-emerald-700 hover:bg-emerald-50',
      }
    : {
        shell: 'border-sky-100 bg-sky-50/50',
        icon: 'bg-primary-600 text-white shadow-primary-600/25',
        badge: 'bg-sky-100 text-sky-800 ring-sky-200',
        accent: 'from-primary-600 to-sky-500',
        detail: 'text-primary-700 hover:bg-primary-50',
      };

  function handleCopyPin() {
    navigator.clipboard.writeText(sala.pin_plano ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <article className={`group overflow-hidden rounded-lg border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${theme.shell}`}>
      <div className={`h-1 bg-gradient-to-r ${theme.accent}`} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-lg ${theme.icon}`}>
              <Icon type={multimedia ? 'file' : 'text'} className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-slate-950">{sala.nombre}</h3>
              <p className="mt-0.5 truncate text-xs text-slate-500">{formatFecha(getFechaCreacion(sala))}</p>
            </div>
          </div>
          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${theme.badge}`}>
            {formatTipoSala(tipo)}
          </span>
        </div>

        {sala.pin_plano && (
          <div className="mt-4 rounded-lg border border-white/70 bg-white/80 p-3 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">PIN de acceso</p>
                <code className="mt-1 block font-mono text-xl font-black tracking-wide text-slate-950">{sala.pin_plano}</code>
              </div>
              <button
                type="button"
                onClick={handleCopyPin}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-primary-200 hover:text-primary-700"
                title={copied ? 'Copiado' : 'Copiar PIN'}
              >
                <Icon type="copy" />
              </button>
            </div>
            {copied && <p className="mt-2 text-xs font-semibold text-primary-700">PIN copiado</p>}
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-white/75 px-3 py-2">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
              <Icon type="users" className="h-3.5 w-3.5" />
              Activos
            </p>
            <p className="mt-1 text-sm font-bold text-slate-950">{usuariosConectados}</p>
          </div>
          <div className="rounded-lg bg-white/75 px-3 py-2">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
              <Icon type="clock" className="h-3.5 w-3.5" />
              Timeout
            </p>
            <p className="mt-1 text-sm font-bold text-slate-950">{getTimeoutMinutos(sala)} min</p>
          </div>
          {multimedia && maxArchivoMb && (
            <div className="col-span-2 rounded-lg bg-white/75 px-3 py-2">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                <Icon type="file" className="h-3.5 w-3.5" />
                Max. archivo
              </p>
              <p className="mt-1 text-sm font-bold text-slate-950">{maxArchivoMb} MB</p>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Link to={`/admin/salas/${sala.id}`} className={`flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/80 bg-white px-3 py-2 text-sm font-bold transition ${theme.detail}`}>
            Detalle
            <Icon type="arrow" className="h-3.5 w-3.5" />
          </Link>
          <Button variant="danger" className="shrink-0 text-xs py-2 px-3" onClick={() => onEliminar(sala.id)}>
            Eliminar
          </Button>
        </div>
      </div>
    </article>
  );
}
