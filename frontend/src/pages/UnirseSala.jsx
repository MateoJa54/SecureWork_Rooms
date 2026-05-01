import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { unirseSala } from '../services/salas.service.js';
import { getDeviceId, getFingerprint, saveSession } from '../services/device.service.js';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';

export default function UnirseSala() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre_sala: '', pin: '', nickname: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const device_id = getDeviceId();
      const fingerprint = await getFingerprint();

      const data = await unirseSala({
        nombre_sala: form.nombre_sala,
        pin: form.pin,
        nickname: form.nickname,
        device_id,
        fingerprint,
      });

      saveSession(data.session_token, data.sala_id, form.nickname);
      navigate(`/sala/${data.sala_id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="card w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Unirse a una sala</h1>
          <p className="text-sm text-gray-500 mt-1">Ingresa el nombre de la sala, el PIN y tu apodo</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <ErrorMessage message={error} />

          <Input
            label="Nombre de la sala"
            value={form.nombre_sala}
            onChange={(e) => set('nombre_sala', e.target.value)}
            required
            placeholder="Sala de trabajo..."
          />
          <Input
            label="PIN"
            type="password"
            value={form.pin}
            onChange={(e) => set('pin', e.target.value)}
            required
            placeholder="PIN de acceso"
          />
          <Input
            label="Tu apodo (nickname)"
            value={form.nickname}
            onChange={(e) => set('nickname', e.target.value)}
            required
            maxLength={30}
            placeholder="Cómo te verán los demás"
          />

          <Button type="submit" loading={loading} className="w-full">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
