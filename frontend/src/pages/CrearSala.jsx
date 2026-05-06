import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { crearSala } from '../services/salas.service.js';
import SalaForm from '../components/admin/SalaForm.jsx';
import Button from '../components/common/Button.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <Link to="/admin/dashboard" className="text-sm text-primary-600 hover:underline">
          ← Volver al dashboard
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Nueva sala</h1>
        <div className="card">
          <ErrorMessage message={error} />
          <SalaForm onSubmit={handleSubmit} loading={loading} />
          <div className="mt-4">
            <Button variant="secondary" className="w-full" onClick={() => navigate('/admin/dashboard')}>
              Cancelar
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
