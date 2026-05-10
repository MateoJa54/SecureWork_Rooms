import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearSala } from '../services/salas.service.js';
import AdminShell from '../components/admin/AdminShell.jsx';
import SalaForm from '../components/admin/SalaForm.jsx';
import Button from '../components/common/Button.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

function Icon({ type, className = 'h-5 w-5' }) {
  const paths = {
    shield: 'M12 3l7 3v5c0 4.5-2.8 8.3-7 10-4.2-1.7-7-5.5-7-10V6l7-3Z',
    pin: 'M9 4h6M10 4v6l-3 4h10l-3-4V4M12 14v6',
  };

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={paths[type]} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CrearSala() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(payload) {
    setLoading(true);
    setError('');
    try {
      await crearSala(payload);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminShell>
      <section className="mx-auto w-full max-w-xl overflow-hidden rounded-lg border border-primary-100 bg-white shadow-xl shadow-primary-900/10">
        <div className="bg-gradient-to-r from-primary-900 via-primary-700 to-sky-500 px-4 py-4 text-white sm:px-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-primary-700 shadow-lg">
              <Icon type="shield" className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-100">Nueva sala segura</p>
              <h1 className="mt-0.5 text-xl font-black">Crear sala</h1>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-white/10 px-3 py-2 ring-1 ring-white/15">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Icon type="pin" className="h-4 w-4" />
              PIN automatico al guardar
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-4 py-5 sm:px-5">
          <ErrorMessage message={error} />
          <SalaForm onSubmit={handleSubmit} loading={loading} />
          <div className="mt-3">
            <Button variant="secondary" className="w-full py-3 text-sm font-bold" onClick={() => navigate('/admin/dashboard')}>
              Cancelar
            </Button>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
