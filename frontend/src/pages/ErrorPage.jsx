import { useSearchParams, Link } from 'react-router-dom';
import Button from '../components/common/Button.jsx';

const MOTIVOS = {
  inactividad: 'Fuiste desconectado por inactividad.',
  expulsado: 'El administrador te expulsó de la sala.',
  sala_cerrada: 'La sala fue cerrada por el administrador.',
  sala_llena: 'La sala está llena. Intenta de nuevo más tarde.',
  pin_invalido: 'PIN incorrecto.',
  dispositivo_duplicado: 'Ya tienes una sesión activa en otra sala.',
};

export default function ErrorPage() {
  const [params] = useSearchParams();
  const motivo = params.get('motivo');
  const mensaje = MOTIVOS[motivo] ?? 'Ocurrió un error inesperado.';

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50 px-4 py-8">
      <div className="card w-full max-w-sm space-y-6 text-center">
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
