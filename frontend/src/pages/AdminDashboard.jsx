import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { listarSalas, eliminarSala } from '../services/salas.service.js';
import SalaCard from '../components/admin/SalaCard.jsx';
import Button from '../components/common/Button.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(true);
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

  async function handleEliminar(id) {
    if (!confirm('¿Eliminar esta sala y todos sus datos?')) return;
    try {
      await eliminarSala(id);
      setSalas((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/', { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">SecureWork Rooms</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user?.email}</span>
          <Button variant="secondary" onClick={handleLogout} className="text-sm py-1 px-3">
            Cerrar sesión
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Salas activas</h2>
          <Link to="/admin/salas/nueva">
            <Button className="text-sm">+ Nueva sala</Button>
          </Link>
        </div>

        <ErrorMessage message={error} />

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : salas.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No hay salas creadas</p>
            <p className="text-sm mt-1">Crea la primera sala para comenzar</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {salas.map((sala) => (
              <SalaCard key={sala.id} sala={sala} onEliminar={handleEliminar} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
