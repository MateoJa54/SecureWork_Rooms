import { Link } from 'react-router-dom';
import { formatTipoSala, formatFecha } from '../../utils/formatters.js';
import Button from '../common/Button.jsx';

export default function SalaCard({ sala, onEliminar }) {
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
            <Button variant="secondary" className="text-xs py-1 px-2">Ver</Button>
          </Link>
          <Button variant="danger" className="text-xs py-1 px-2" onClick={() => onEliminar(sala.id)}>
            Eliminar
          </Button>
        </div>
      </div>
      <div className="text-xs text-gray-500 space-y-1">
        <p>PIN: <span className="font-mono font-bold text-gray-900 bg-yellow-50 px-2 py-1 rounded">{sala.pin_plano}</span></p>
        <p>Capacidad: <span className="font-medium text-gray-700">{sala.capacidad_maxima} usuarios</span></p>
        <p>Inactividad: <span className="font-medium text-gray-700">{sala.timeout_inactividad}s</span></p>
        {sala.tamanio_max_archivo_mb && (
          <p>Máx. archivo: <span className="font-medium text-gray-700">{sala.tamanio_max_archivo_mb} MB</span></p>
        )}
        <p>Creada: <span className="font-medium text-gray-700">{formatFecha(sala.creado_en)}</span></p>
      </div>
    </div>
  );
}
