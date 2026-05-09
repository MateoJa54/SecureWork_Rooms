import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarSalas, eliminarSala } from '../services/salas.service.js';
import AdminShell from '../components/admin/AdminShell.jsx';
import SalaCard from '../components/admin/SalaCard.jsx';
import DeleteSalaModal from '../components/admin/DeleteSalaModal.jsx';
import Button from '../components/common/Button.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import { getFechaCreacion, isSalaMultimedia } from '../utils/formatters.js';

function SearchIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m21 21-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function sortByRecent(a, b) {
  return new Date(getFechaCreacion(b) || 0) - new Date(getFechaCreacion(a) || 0);
}

export default function AdminSalasPorTipo({ tipo }) {
  const isArchivos = tipo === 'archivos';
  const [salas, setSalas] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [salaToDelete, setSalaToDelete] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setLoading(true);
    setError('');
    try {
      const data = await listarSalas();
      setSalas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleEliminar(sala) {
    setDeleting(true);
    setError('');
    try {
      await eliminarSala(sala.id);
      setSalas((prev) => prev.filter((s) => s.id !== sala.id));
      setSalaToDelete(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  const filtradas = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return salas
      .filter((sala) => (isArchivos ? isSalaMultimedia(sala) : !isSalaMultimedia(sala)))
      .filter((sala) => !normalized || sala.nombre?.toLowerCase().includes(normalized))
      .sort(sortByRecent);
  }, [salas, isArchivos, query]);

  return (
    <AdminShell>
      <section className={`mb-6 overflow-hidden rounded-lg border bg-white shadow-sm ${isArchivos ? 'border-emerald-100' : 'border-sky-100'}`}>
        <div className={`h-1 bg-gradient-to-r ${isArchivos ? 'from-emerald-500 to-teal-500' : 'from-primary-600 to-sky-500'}`} />
        <div className="flex flex-col gap-4 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className={`text-xs font-bold uppercase tracking-wide ${isArchivos ? 'text-emerald-700' : 'text-sky-700'}`}>
              {isArchivos ? 'Salas multimedia' : 'Salas de texto'}
            </p>
            <h1 className="mt-1 text-xl font-bold text-slate-950">
              {isArchivos ? 'Archivos' : 'Texto'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {isArchivos ? 'Gestiona salas que permiten compartir imagenes y documentos.' : 'Gestiona salas enfocadas solo en mensajes.'}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <SearchIcon />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-800 outline-none transition focus:border-primary-300 focus:bg-white focus:ring-4 focus:ring-primary-50 sm:w-72"
              />
            </div>
            <Link to="/admin/salas/nueva">
              <Button className="h-10 text-sm">Nueva sala</Button>
            </Link>
          </div>
        </div>
        <div className="border-t border-slate-100 px-5 py-3">
          <p className="text-sm font-semibold text-slate-600">
            {filtradas.length} {filtradas.length === 1 ? 'sala encontrada' : 'salas encontradas'}
          </p>
        </div>
      </section>

      <ErrorMessage message={error} />

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600" />
        </div>
      ) : filtradas.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white py-16 text-center">
          <p className="text-lg font-semibold text-slate-700">No hay salas para mostrar</p>
          <p className="mt-1 text-sm text-slate-400">Ajusta la busqueda o crea una nueva sala.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtradas.map((sala) => (
            <SalaCard key={sala.id} sala={sala} onEliminar={() => setSalaToDelete(sala)} />
          ))}
        </div>
      )}
      <DeleteSalaModal
        sala={salaToDelete}
        loading={deleting}
        onCancel={() => setSalaToDelete(null)}
        onConfirm={handleEliminar}
      />
    </AdminShell>
  );
}
