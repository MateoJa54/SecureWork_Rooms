import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listarSalas, eliminarSala } from '../services/salas.service.js';
import AdminShell from '../components/admin/AdminShell.jsx';
import SalaCard from '../components/admin/SalaCard.jsx';
import DeleteSalaModal from '../components/admin/DeleteSalaModal.jsx';
import Button from '../components/common/Button.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import { getFechaCreacion, isSalaMultimedia } from '../utils/formatters.js';

function sortByRecent(a, b) {
  return new Date(getFechaCreacion(b) || 0) - new Date(getFechaCreacion(a) || 0);
}

function StatCard({ label, value, tone }) {
  const tones = {
    total: 'bg-primary-50 text-primary-700 border-primary-100',
    text: 'bg-sky-50 text-sky-700 border-sky-100',
    media: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };

  return (
    <div className={`rounded-lg border p-4 ${tones[tone]}`}>
      <p className="text-xs font-bold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-2 text-3xl font-black">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [salas, setSalas] = useState([]);
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

  const texto = salas.filter((s) => !isSalaMultimedia(s));
  const multimedia = salas.filter(isSalaMultimedia);
  const recientes = [...salas].sort(sortByRecent).slice(0, 2);

  return (
    <AdminShell>
      <section className="mb-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-950">Estado general</h1>
            <p className="text-sm text-slate-500">Resumen de salas activas y acceso rapido a la administracion.</p>
          </div>
          <Link to="/admin/salas/nueva">
            <Button className="text-sm">Nueva sala</Button>
          </Link>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-3">
          <StatCard label="Salas creadas" value={salas.length} tone="total" />
          <StatCard label="Solo texto" value={texto.length} tone="text" />
          <StatCard label="Archivos" value={multimedia.length} tone="media" />
        </div>
      </section>

      <ErrorMessage message={error} />

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600" />
        </div>
      ) : salas.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white py-16 text-center text-slate-400">
          <p className="text-lg font-semibold text-slate-600">No hay salas creadas</p>
          <p className="mt-1 text-sm">Crea la primera sala para comenzar</p>
        </div>
      ) : (
        <section>
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Salas mas recientes</h2>
              <p className="text-sm text-slate-500">Ultimas dos salas creadas.</p>
            </div>
            <div className="flex gap-2">
              <Link to="/admin/salas/texto" className="rounded-lg bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-100">
                Ver texto
              </Link>
              <Link to="/admin/salas/archivos" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100">
                Ver archivos
              </Link>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {recientes.map((sala) => (
              <SalaCard key={sala.id} sala={sala} onEliminar={() => setSalaToDelete(sala)} />
            ))}
          </div>
        </section>
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
