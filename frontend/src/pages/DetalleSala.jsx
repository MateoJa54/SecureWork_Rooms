import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSala } from '../hooks/useSala.js';
import { expulsarUsuario } from '../services/salas.service.js';
import AdminShell from '../components/admin/AdminShell.jsx';
import UsuariosConectados from '../components/admin/UsuariosConectados.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import {
  formatFecha,
  formatFechaLarga,
  formatTipoSala,
  getFechaCreacion,
  getMaxArchivoMb,
  getTimeoutMinutos,
  getTipoSala,
  isSalaMultimedia,
} from '../utils/formatters.js';

function Icon({ type, className = 'h-4 w-4' }) {
  const paths = {
    text: 'M5 7h14M5 12h10M5 17h7',
    file: 'M7 3h7l4 4v14H7V3ZM14 3v5h4',
    users: 'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.5 19a4.5 4.5 0 0 1 9 0M16 10a2.5 2.5 0 1 0 0-5',
    clock: 'M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    calendar: 'M7 3v3M17 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z',
    copy: 'M8 8h10v12H8V8ZM6 16H4V4h10v2',
    arrow: 'M15 18l-6-6 6-6',
    shield: 'M12 3l7 3v5c0 4.5-2.8 8.3-7 10-4.2-1.7-7-5.5-7-10V6l7-3Z',
  };

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={paths[type]} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MetricItem({ icon, label, value }) {
  return (
    <div className="rounded-lg bg-white/80 px-3 py-2">
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
        <Icon type={icon} className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}

export default function DetalleSala() {
  const { id } = useParams();
  const { sala, loading, error, recargar } = useSala(id);
  const [loadingNick, setLoadingNick] = useState('');
  const [expError, setExpError] = useState('');
  const [copied, setCopied] = useState(false);

  const tipo = getTipoSala(sala);
  const multimedia = isSalaMultimedia(sala);
  const usuarios = sala?.sesiones ?? [];
  const maxArchivoMb = getMaxArchivoMb(sala);
  const backPath = multimedia ? '/admin/salas/archivos' : '/admin/salas/texto';
  const backLabel = multimedia ? 'Volver a archivos' : 'Volver a texto';
  const theme = multimedia
    ? {
        shell: 'border-emerald-100 bg-emerald-50/50',
        accent: 'from-emerald-500 to-teal-500',
        icon: 'bg-emerald-600 text-white shadow-emerald-600/25',
        badge: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
      }
    : {
        shell: 'border-sky-100 bg-sky-50/50',
        accent: 'from-primary-600 to-sky-500',
        icon: 'bg-primary-600 text-white shadow-primary-600/25',
        badge: 'bg-sky-100 text-sky-800 ring-sky-200',
      };

  useEffect(() => {
    if (!sala) return undefined;
    const interval = window.setInterval(() => {
      recargar({ silent: true });
    }, 5000);

    return () => window.clearInterval(interval);
  }, [recargar, sala]);

  async function handleExpulsar(nickname) {
    setExpError('');
    setLoadingNick(nickname);
    try {
      await expulsarUsuario(id, nickname);
      recargar();
    } catch (err) {
      setExpError(err.message);
    } finally {
      setLoadingNick('');
    }
  }

  function handleCopyPin() {
    if (!sala?.pin_plano) return;
    navigator.clipboard.writeText(sala.pin_plano);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <AdminShell>
      {loading && (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600" />
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      {sala && (
        <div className="mx-auto w-full max-w-3xl space-y-4">
          <Link to={backPath} className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-bold text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:text-primary-700 hover:ring-primary-200">
            <Icon type="arrow" className="h-4 w-4" />
            {backLabel}
          </Link>

          <section className={`overflow-hidden rounded-lg border bg-white shadow-xl shadow-primary-900/10 ${theme.shell}`}>
            <div className={`h-1 bg-gradient-to-r ${theme.accent}`} />
            <div className="p-4 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3 sm:items-center">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg shadow-lg ${theme.icon}`}>
                    <Icon type={multimedia ? 'file' : 'text'} className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="min-w-0 break-words text-xl font-black text-slate-950">{sala.nombre}</h1>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${theme.badge}`}>
                        {formatTipoSala(tipo)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {multimedia ? 'Sala con soporte para archivos.' : 'Sala solo para mensajes de texto.'}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg bg-white/80 px-4 py-3 text-left shadow-sm sm:text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Usuarios activos</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">{usuarios.length}</p>
                </div>
              </div>

              {sala.pin_plano && (
                <div className="mt-4 rounded-lg bg-white/85 px-3 py-3 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Codigo de acceso</p>
                      <code className="mt-1 block break-all font-mono text-xl font-black tracking-wide text-slate-950">{sala.pin_plano}</code>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyPin}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-primary-200 hover:text-primary-700"
                      title={copied ? 'Copiado' : 'Copiar codigo'}
                    >
                      <Icon type="copy" />
                    </button>
                  </div>
                  <div className="h-5">
                    {copied && <p className="mt-1 text-xs font-bold text-primary-700">Codigo copiado</p>}
                  </div>
                </div>
              )}

              <div className={`mt-4 grid gap-2 ${multimedia && maxArchivoMb ? 'sm:grid-cols-2 lg:grid-cols-5' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
                <MetricItem icon="shield" label="Tipo" value={formatTipoSala(tipo)} />
                <MetricItem icon="users" label="Conectados" value={`${usuarios.length}`} />
                <MetricItem icon="clock" label="Timeout" value={`${getTimeoutMinutos(sala)} min`} />
                <MetricItem icon="calendar" label="Creada" value={formatFechaLarga(getFechaCreacion(sala)) || formatFecha(getFechaCreacion(sala))} />
                {multimedia && maxArchivoMb && (
                  <MetricItem icon="file" label="Archivo" value={`${maxArchivoMb} MB`} />
                )}
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:items-center sm:px-5">
              <div>
                <h2 className="text-base font-bold text-slate-950">Usuarios conectados</h2>
                <p className="mt-0.5 text-sm text-slate-500">Sesiones activas y expulsion de usuarios.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {usuarios.length}
              </span>
            </div>
            <div className="p-3 sm:p-4">
              <ErrorMessage message={expError} />
              <UsuariosConectados
                usuarios={usuarios}
                onExpulsar={handleExpulsar}
                loadingNick={loadingNick}
              />
            </div>
          </section>
        </div>
      )}
    </AdminShell>
  );
}
