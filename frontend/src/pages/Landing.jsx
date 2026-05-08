import { Link } from 'react-router-dom';
import Button from '../components/common/Button.jsx';
import { useDeviceId } from '../hooks/useDeviceId.js';

export default function Landing() {
  useDeviceId();

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-primary-900 via-primary-700 to-sky-500">
      <div className="absolute inset-x-0 bottom-0 h-[44%] bg-white lg:inset-y-0 lg:left-auto lg:right-0 lg:h-full lg:w-[45%]" />
      <div className="absolute bottom-[36%] left-[-8%] h-40 w-[116%] rounded-[50%] bg-white lg:bottom-auto lg:left-auto lg:right-[38%] lg:top-[-12%] lg:h-[124%] lg:w-56" />
      <div className="absolute bottom-[42%] left-10 h-12 w-12 rounded-full bg-white/80 lg:left-auto lg:right-[43%] lg:top-20" />
      <div className="absolute bottom-[40%] left-28 h-16 w-16 rounded-full bg-white/70 lg:left-auto lg:right-[44%] lg:top-40" />
      <div className="absolute bottom-[42%] right-16 h-12 w-12 rounded-full bg-white/80 lg:right-[42%] lg:top-72" />
      <div className="absolute hidden h-16 w-16 rounded-full bg-white/70 lg:bottom-36 lg:right-[44%] lg:block" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[52%_48%]">
        <section className="flex min-h-[48vh] flex-col items-center justify-center px-8 pb-24 pt-12 text-center text-white lg:min-h-screen lg:px-20 lg:pb-12 xl:px-28">
          <p className="text-sm font-medium text-blue-100">Bienvenido a</p>
          <div className="mt-8 flex h-24 w-24 items-center justify-center rounded-full bg-white text-3xl font-bold text-primary-700 shadow-xl shadow-blue-950/25">
            SW
          </div>
          <h1 className="mt-6 max-w-xl text-center text-4xl font-semibold leading-tight sm:text-5xl">
            SecureWork Rooms
          </h1>
          <p className="mt-6 max-w-md text-center text-base leading-7 text-blue-100">
            Salas de chat seguras y en tiempo real, protegidas por PIN para equipos que necesitan entrar rapido y trabajar con control.
          </p>
        </section>

        <section className="flex items-center justify-center px-7 pb-10 lg:min-h-screen lg:px-16 lg:py-12 xl:px-24">
          <div className="w-full max-w-md">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase text-primary-600">Inicio rapido</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-950">Elige como ingresar</h2>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500">
                Entra con un PIN de sala o administra los espacios activos desde tu panel.
              </p>
            </div>

            <div className="mt-9 flex flex-col gap-4">
              <Link to="/unirse" className="w-full">
                <Button className="w-full rounded-full bg-gradient-to-r from-primary-700 to-sky-500 px-8 py-3 text-base font-semibold shadow-lg shadow-primary-600/25 hover:from-primary-800 hover:to-sky-600">
                  Unirse a una sala
                </Button>
              </Link>
              <Link to="/admin/login" className="w-full">
                <Button
                  variant="secondary"
                  className="w-full rounded-full border-primary-200 px-8 py-3 text-base font-semibold text-primary-700 hover:bg-primary-50"
                >
                  Administrar
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
