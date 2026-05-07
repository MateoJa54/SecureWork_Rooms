import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

export default function AdminLogin() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Correo electronico invalido');
      return;
    }
    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-primary-900 via-primary-700 to-sky-500">
      <div className="absolute inset-x-0 bottom-0 h-[44%] bg-white lg:inset-y-0 lg:left-auto lg:right-0 lg:h-full lg:w-[45%]" />
      <div className="absolute bottom-[36%] left-[-8%] h-36 w-[116%] rounded-[50%] bg-white lg:bottom-auto lg:left-auto lg:right-[38%] lg:top-[-12%] lg:h-[124%] lg:w-52" />
      <div className="absolute bottom-[42%] left-12 h-12 w-12 rounded-full bg-white/80 lg:left-auto lg:right-[43%] lg:top-20" />
      <div className="absolute bottom-[40%] left-28 h-16 w-16 rounded-full bg-white/70 lg:left-auto lg:right-[44%] lg:top-40" />
      <div className="absolute hidden h-14 w-14 rounded-full bg-white/80 lg:right-[42%] lg:top-72 lg:block" />
      <div className="absolute hidden h-16 w-16 rounded-full bg-white/70 lg:bottom-36 lg:right-[44%] lg:block" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[52%_48%]">
        <section className="flex min-h-[44vh] flex-col items-center justify-center px-8 pb-24 pt-10 text-center text-white lg:min-h-screen lg:px-20 lg:pb-10 xl:px-28">
          <p className="text-sm font-medium text-blue-100">Bienvenido a</p>
          <div className="mt-8 flex h-20 w-20 items-center justify-center rounded-full bg-white text-2xl font-bold text-primary-700 shadow-xl shadow-blue-950/25">
            SW
          </div>
          <h1 className="mt-5 text-center text-3xl font-semibold">SecureWork</h1>
          <p className="mt-8 max-w-xs text-center text-sm leading-6 text-blue-100">
            Gestiona salas seguras, usuarios conectados y configuraciones desde el panel administrativo.
          </p>
        </section>

        <section className="flex items-center justify-center px-7 pb-10 lg:min-h-screen lg:px-16 lg:py-12 xl:px-24">
          <div className="w-full max-w-md">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100">
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 3.25 18.25 6v5.25c0 4.05-2.5 7.7-6.25 9.05-3.75-1.35-6.25-5-6.25-9.05V6L12 3.25Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9.5 12.1 11.25 14l3.5-4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="mt-6 text-xs font-semibold uppercase text-primary-600">Acceso administrativo</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-950">Panel de administracion</h2>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500">
                Inicia sesion con tus credenciales para gestionar salas y usuarios.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-9 flex flex-col gap-5">
              <ErrorMessage message={error} />

              <Input
                label="Correo electronico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="border-x-0 border-t-0 rounded-none px-0 text-base text-slate-900 placeholder:text-slate-400 focus:ring-0 focus:border-primary-500"
              />
              <Input
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="border-x-0 border-t-0 rounded-none px-0 text-base text-slate-900 placeholder:text-slate-400 focus:ring-0 focus:border-primary-500"
              />

              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                className="mt-3 w-full rounded-full bg-gradient-to-r from-primary-700 to-sky-500 py-3 text-base font-semibold shadow-lg shadow-primary-600/25 hover:from-primary-800 hover:to-sky-600"
              >
                {loading ? 'Ingresando...' : 'Iniciar sesion'}
              </Button>
            </form>

            <Link to="/" className="mt-6 block text-center text-sm font-semibold text-primary-700 hover:text-primary-900">
              Volver al inicio
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
