import { useState } from 'react';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';

const DEFAULTS = {
  nombre: '',
  pin: '',
  tipo_sala: 'texto',
  capacidad_maxima: 10,
  timeout_inactividad: 300,
  tamanio_max_archivo_mb: '',
};

export default function SalaForm({ onSubmit, loading }) {
  const [form, setForm] = useState(DEFAULTS);
  const [error, setError] = useState('');

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.pin.length < 4) {
      setError('El PIN debe tener al menos 4 caracteres');
      return;
    }
    try {
      const payload = {
        nombre: form.nombre,
        pin: form.pin,
        tipo: form.tipo_sala,
        timeout_min: Math.floor(Number(form.timeout_inactividad) / 60),
        max_size_mb: form.tamanio_max_archivo_mb ? Number(form.tamanio_max_archivo_mb) : 10,
      };
      await onSubmit(payload);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <ErrorMessage message={error} />

      <Input
        label="Nombre de la sala"
        value={form.nombre}
        onChange={(e) => set('nombre', e.target.value)}
        required
        maxLength={100}
        placeholder="Sala de trabajo..."
      />

      <Input
        label="PIN de acceso"
        type="password"
        value={form.pin}
        onChange={(e) => set('pin', e.target.value)}
        required
        minLength={4}
        placeholder="Mínimo 4 caracteres"
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Tipo de sala</label>
        <select
          className="input-field"
          value={form.tipo_sala}
          onChange={(e) => set('tipo_sala', e.target.value)}
        >
          <option value="texto">Solo texto</option>
          <option value="multimedia">Multimedia (archivos)</option>
        </select>
      </div>

      <Input
        label="Capacidad máxima de usuarios"
        type="number"
        value={form.capacidad_maxima}
        onChange={(e) => set('capacidad_maxima', e.target.value)}
        min={2}
        max={100}
        required
      />

      <Input
        label="Tiempo de inactividad (segundos)"
        type="number"
        value={form.timeout_inactividad}
        onChange={(e) => set('timeout_inactividad', e.target.value)}
        min={60}
        max={3600}
        required
      />

      {form.tipo_sala === 'multimedia' && (
        <Input
          label="Tamaño máximo de archivo (MB)"
          type="number"
          value={form.tamanio_max_archivo_mb}
          onChange={(e) => set('tamanio_max_archivo_mb', e.target.value)}
          min={1}
          max={100}
          placeholder="Ej: 10"
        />
      )}

      <Button type="submit" loading={loading}>
        Crear sala
      </Button>
    </form>
  );
}
