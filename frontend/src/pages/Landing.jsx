import { Link } from 'react-router-dom';
import Button from '../components/common/Button.jsx';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-600 flex flex-col items-center justify-center text-white px-4">
      <div className="max-w-lg w-full text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-3">SecureWork Rooms</h1>
          <p className="text-primary-100 text-lg">
            Salas de chat seguras y en tiempo real, protegidas por PIN.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/unirse">
            <Button className="w-full sm:w-auto px-8 py-3 text-base">
              Unirse a una sala
            </Button>
          </Link>
          <Link to="/admin/login">
            <Button variant="secondary" className="w-full sm:w-auto px-8 py-3 text-base">
              Administrar
            </Button>
          </Link>
        </div>

        <p className="text-primary-200 text-sm">
          ¿Primera vez? Pide el PIN al administrador de la sala.
        </p>
      </div>
    </div>
  );
}
