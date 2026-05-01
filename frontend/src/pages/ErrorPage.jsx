import { useSearchParams, Link } from 'react-router-dom';
import Button from '../components/common/Button.jsx';

const MOTIVOS = {
  inactividad: 'Fuiste desconectado por inactividad.',
  expulsion: 'El administrador te expulsó de la sala.',
  sala_llena: 'La sala está llena. Intenta de nuevo más tarde.',
  pin_invalido: 'PIN incorrecto.',
  dispositivo_duplicado: 'Ya tienes una sesión activa en otra sala.',
};

export default function ErrorPage() {
  const [params] = useSearchParams();
  const motivo = params.get('motivo');
  const mensaje = MOTIVOS[motivo] ?? 'Ocurrió un error inesperado.';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="card max-w-sm w-full text-center space-y-6">
        <div>
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-900">Acceso interrumpido</h1>
          <p className="text-gray-600 mt-2">{mensaje}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Link to="/unirse">
            <Button className="w-full">Volver a unirse</Button>
          </Link>
          <Link to="/">
            <Button variant="secondary" className="w-full">Inicio</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
