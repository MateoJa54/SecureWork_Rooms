import { useState } from 'react';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';

const DEFAULTS = {
  nombre: '',
  tipo: 'texto',
  max_size_mb: 5,
  timeout_min: 10,
};

export default function SalaForm({ onSubmit, loading }) {
  const [form, setForm] = useState(DEFAULTS);
  const [error, setError] = useState('');

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate() {
    if (!form.nombre || form.nombre.length < 3) {
      return 'El nombre debe tener al menos 3 caracteres';
    }
    if (form.nombre.length > 100) {
      return 'El nombre no puede exceder 100 caracteres';
    }
    if (form.tipo !== 'texto' && form.tipo !== 'multimedia') {
      return 'El tipo de sala es inválido';
    }
    if (form.tipo === 'multimedia') {
      const mb = Number(form.max_size_mb);
      if (!mb || mb < 1 || mb > 10) {
        return 'El tamaño máximo de archivo debe estar entre 1 y 10 MB';
      }
    }
    const timeout = Number(form.timeout_min);
    if (!timeout || timeout < 1 || timeout > 60) {
      return 'El timeout debe estar entre 1 y 60 minutos';
    }
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      const payload = {
        nombre: form.nombre.trim(),
        tipo: form.tipo,
        max_size_mb: form.tipo === 'multimedia' ? Number(form.max_size_mb) : undefined,
        timeout_min: Number(form.timeout_min),
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
        minLength={3}
        maxLength={100}
        placeholder="Sala de trabajo..."
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Tipo de sala</label>
        <select
          className="input-field"
          value={form.tipo}
          onChange={(e) => set('tipo', e.target.value)}
        >
          <option value="texto">Solo texto</option>
          <option value="multimedia">Multimedia (archivos)</option>
        </select>
      </div>

      {form.tipo === 'multimedia' && (
        <Input
          label="Tamaño máximo de archivo (MB)"
          type="number"
          value={form.max_size_mb}
          onChange={(e) => set('max_size_mb', e.target.value)}
          min={1}
          max={10}
          required
          placeholder="1-10"
        />
      )}

      <Input
        label="Timeout de inactividad (minutos)"
        type="number"
        value={form.timeout_min}
        onChange={(e) => set('timeout_min', e.target.value)}
        min={1}
        max={60}
        required
        placeholder="1-60"
      />

      <Button type="submit" loading={loading}>
        Crear sala
      </Button>
    </form>
  );
}
