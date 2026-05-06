import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatTipoSala, formatFecha } from '../../utils/formatters.js';
import Button from '../common/Button.jsx';

export default function SalaCard({ sala, onEliminar }) {
  const [copied, setCopied] = useState(false);

  function handleCopyPin() {
    navigator.clipboard.writeText(sala.pin_plano ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{sala.nombre}</h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sala.tipo_sala === 'multimedia' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
            {formatTipoSala(sala.tipo_sala)}
          </span>
        </div>
        <div className="flex gap-2">
          <Link to={`/admin/salas/${sala.id}`}>
            <Button variant="secondary" className="text-xs py-1 px-2">Ver detalle</Button>
          </Link>
          <Button variant="danger" className="text-xs py-1 px-2" onClick={() => onEliminar(sala.id)}>
            Eliminar
          </Button>
        </div>
      </div>

      {sala.pin_plano && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">PIN:</span>
          <code className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded">{sala.pin_plano}</code>
          <button
            onClick={handleCopyPin}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            {copied ? '¡Copiado!' : 'Copiar'}
          </button>
        </div>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        {sala.usuarios_conectados != null && (
          <p>Conectados: <span className="font-medium text-gray-700">{sala.usuarios_conectados}</span></p>
        )}
        <p>Timeout: <span className="font-medium text-gray-700">{sala.timeout_inactividad_min} min</span></p>
        {sala.max_file_size_mb && (
          <p>Máx. archivo: <span className="font-medium text-gray-700">{sala.max_file_size_mb} MB</span></p>
        )}
        <p>Creada: <span className="font-medium text-gray-700">{formatFecha(sala.creada_en)}</span></p>
      </div>
    </div>
  );
}
