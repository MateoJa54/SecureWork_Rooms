import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { unirseSala } from '../services/salas.service.js';
import { saveSession } from '../services/device.service.js';
import { useDeviceId } from '../hooks/useDeviceId.js';
import { calcFingerprint } from '../utils/fingerprint.js';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

function getJoinErrorMessage(err) {
  const codigo = err.codigo;
  const message = err.message ?? '';
  const normalized = message.toLowerCase();

  if (codigo === 'PIN_INVALIDO' || normalized.includes('pin')) {
    return 'PIN incorrecto. Revisa el codigo e intenta nuevamente.';
  }

  if (normalized.includes('nickname')) {
    return 'Ese nickname ya esta en uso dentro de la sala. Elige otro.';
  }

  if (normalized.includes('dispositivo') || normalized.includes('device')) {
    return 'Este dispositivo ya esta unido a otra sala activa. Sal de esa sala antes de unirte a una nueva.';
  }

  if (codigo === 'DATOS_INVALIDOS') {
    return 'Completa el PIN y tu nickname para unirte.';
  }

  return 'No pudimos unirte a la sala. Intenta nuevamente en unos segundos.';
}

export default function UnirseSala() {
  const navigate = useNavigate();
  const deviceId = useDeviceId();
  const [form, setForm] = useState({ pin: '', nickname: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const pin = form.pin.trim();
    const nickname = form.nickname.trim();

    if (!pin || !nickname) {
      setError('Completa el PIN y tu nickname para unirte.');
      return;
    }

    if (!deviceId) {
      setError('No pudimos preparar el identificador de este dispositivo. Intenta nuevamente.');
      return;
    }

    setLoading(true);
    try {
      const fingerprint = await calcFingerprint();

      const data = await unirseSala({
        pin,
        nickname,
        device_id: deviceId,
        fingerprint,
      });

      saveSession(data.session_token, data.sala_id, nickname);
      navigate(`/sala/${data.sala_id}`);
    } catch (err) {
      setError(getJoinErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-primary-900 via-primary-700 to-sky-500">
      <div className="absolute inset-x-0 bottom-0 h-[58%] bg-white lg:inset-y-0 lg:left-auto lg:right-0 lg:h-full lg:w-[45%]" />
      <div className="absolute bottom-[52%] left-[-10%] h-24 w-[120%] rounded-[50%] bg-white lg:bottom-auto lg:left-auto lg:right-[38%] lg:top-[-12%] lg:h-[124%] lg:w-52" />
      <div className="absolute bottom-[60%] left-12 h-10 w-10 rounded-full bg-white/80 lg:left-auto lg:right-[43%] lg:top-20 lg:h-12 lg:w-12" />
      <div className="absolute bottom-[58%] left-28 h-12 w-12 rounded-full bg-white/70 lg:left-auto lg:right-[44%] lg:top-40 lg:h-16 lg:w-16" />
      <div className="absolute hidden h-14 w-14 rounded-full bg-white/80 lg:right-[42%] lg:top-72 lg:block" />
      <div className="absolute hidden h-16 w-16 rounded-full bg-white/70 lg:bottom-36 lg:right-[44%] lg:block" />

      <div className="relative z-10 grid min-h-dvh lg:min-h-screen lg:grid-cols-[52%_48%]">
        <section className="flex min-h-[34dvh] flex-col items-center justify-center px-5 pb-12 pt-7 text-center text-white sm:px-8 lg:min-h-screen lg:px-20 lg:pb-10 xl:px-28">
          <p className="text-sm font-medium text-blue-100">Bienvenido a</p>
          <div className="mt-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-lg font-bold text-primary-700 shadow-xl shadow-blue-950/25 sm:h-20 sm:w-20 sm:text-2xl">
            SW
          </div>
          <h1 className="mt-4 text-center text-2xl font-semibold sm:text-3xl">SecureWork Rooms</h1>
          <p className="mt-4 max-w-xs text-center text-sm leading-6 text-blue-100 sm:mt-8">
            Entra a tu sala con el PIN compartido y conserva tu sesion segura desde este dispositivo.
          </p>
        </section>

        <section className="flex items-start justify-center px-5 pb-8 pt-4 sm:px-7 lg:min-h-screen lg:items-center lg:px-16 lg:py-12 xl:px-24">
          <div className="w-full max-w-md">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 shadow-sm ring-1 ring-sky-100 sm:h-16 sm:w-16">
                <svg className="h-6 w-6 sm:h-8 sm:w-8" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M14.75 9.25a4 4 0 1 0-2.55 3.73L14.75 15.5h2.5v2.25H19.5V20H22v-3.75l-6.2-6.2a4.03 4.03 0 0 0-1.05-.8Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7.5 8.5h.01"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p className="mt-4 text-xs font-semibold uppercase text-sky-600 sm:mt-6">Acceso a sala</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">Unirse a una sala</h2>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500">
                Ingresa el PIN compartido y el nickname que usaras dentro del chat.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5 sm:mt-9">
              <ErrorMessage message={error} />

              <Input
                label="PIN"
                type="password"
                value={form.pin}
                onChange={(e) => set('pin', e.target.value)}
                required
                autoComplete="one-time-code"
                placeholder="PIN de acceso"
                className="border-x-0 border-t-0 rounded-none px-0 text-base text-slate-900 placeholder:text-slate-400 focus:ring-0 focus:border-primary-500"
              />
              <Input
                label="Tu apodo (nickname)"
                value={form.nickname}
                onChange={(e) => set('nickname', e.target.value)}
                required
                maxLength={30}
                autoComplete="nickname"
                placeholder="Como te veran los demas"
                className="border-x-0 border-t-0 rounded-none px-0 text-base text-slate-900 placeholder:text-slate-400 focus:ring-0 focus:border-primary-500"
              />

              <Button
                type="submit"
                loading={loading}
                disabled={!deviceId}
                className="mt-3 w-full rounded-full bg-gradient-to-r from-primary-700 to-sky-500 py-3 text-base font-semibold shadow-lg shadow-primary-600/25 hover:from-primary-800 hover:to-sky-600"
              >
                Entrar
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
