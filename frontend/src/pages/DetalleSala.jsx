import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSala } from '../hooks/useSala.js';
import { expulsarUsuario } from '../services/salas.service.js';
import UsuariosConectados from '../components/admin/UsuariosConectados.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import { formatFecha, formatTipoSala } from '../utils/formatters.js';

export default function DetalleSala() {
  const { id } = useParams();
  const { sala, loading, error, recargar } = useSala(id);
  const [loadingNick, setLoadingNick] = useState('');
  const [expError, setExpError] = useState('');

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <Link to="/admin/dashboard" className="text-sm text-primary-600 hover:underline">
          ← Volver al dashboard
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        )}

        {error && <ErrorMessage message={error} />}

        {sala && (
          <>
            <div className="card space-y-3">
              <h1 className="text-2xl font-bold text-gray-900">{sala.nombre}</h1>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <dt className="text-gray-500">Tipo</dt>
                <dd className="font-medium">{formatTipoSala(sala.tipo_sala)}</dd>
                <dt className="text-gray-500">Capacidad</dt>
                <dd className="font-medium">{sala.capacidad_maxima} usuarios</dd>
                <dt className="text-gray-500">Timeout inactividad</dt>
                <dd className="font-medium">{sala.timeout_inactividad}s</dd>
                {sala.tamanio_max_archivo_mb && (
                  <>
                    <dt className="text-gray-500">Máx. archivo</dt>
                    <dd className="font-medium">{sala.tamanio_max_archivo_mb} MB</dd>
                  </>
                )}
                <dt className="text-gray-500">Creada</dt>
                <dd className="font-medium">{formatFecha(sala.creado_en)}</dd>
              </dl>
            </div>

            <div className="card">
              <h2 className="font-semibold text-gray-800 mb-3">Usuarios conectados</h2>
              <ErrorMessage message={expError} />
              <UsuariosConectados
                usuarios={sala.sesiones ?? []}
                onExpulsar={handleExpulsar}
                loadingNick={loadingNick}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
