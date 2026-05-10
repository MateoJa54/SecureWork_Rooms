import { useState } from 'react';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import ErrorMessage from '../common/ErrorMessage.jsx';

const DEFAULTS = {
  nombre: '',
  tipo: 'texto',
  max_size_mb: 5,
  timeout_min: 10,
  max_usuarios: 50,
};

function Icon({ type, className = 'h-4 w-4' }) {
  const paths = {
    text: 'M5 7h14M5 12h10M5 17h7',
    file: 'M7 3h7l4 4v14H7V3ZM14 3v5h4',
  };

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={paths[type]} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TypeOption({ active, icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[72px] flex-1 items-start gap-2.5 rounded-lg border p-3 text-left transition ${
        active
          ? 'border-primary-300 bg-primary-50 text-primary-900 ring-4 ring-primary-50'
          : 'border-slate-200 bg-white text-slate-700 hover:border-primary-200 hover:bg-slate-50'
      }`}
    >
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
        <Icon type={icon} className="h-3.5 w-3.5" />
      </span>
      <span>
        <span className="block text-sm font-bold">{title}</span>
        <span className="mt-0.5 block text-xs leading-4 text-slate-500">{description}</span>
      </span>
    </button>
  );
}

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
      return 'El tipo de sala es invalido';
    }
    if (form.tipo === 'multimedia') {
      const mb = Number(form.max_size_mb);
      if (!mb || mb < 1 || mb > 10) {
        return 'El tamano maximo de archivo debe estar entre 1 y 10 MB';
      }
    }
    const timeout = Number(form.timeout_min);
    if (!timeout || timeout < 1 || timeout > 60) {
      return 'El timeout debe estar entre 1 y 60 minutos';
    }
    const maxUsr = Number(form.max_usuarios);
    if (!maxUsr || maxUsr < 1 || maxUsr > 50) {
      return 'El maximo de usuarios debe estar entre 1 y 50';
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
        max_usuarios: Number(form.max_usuarios),
      };
      await onSubmit(payload);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorMessage message={error} />

      <Input
        label="Nombre de la sala"
        value={form.nombre}
        onChange={(e) => set('nombre', e.target.value)}
        required
        minLength={3}
        maxLength={100}
        placeholder="Ej. Equipo de soporte"
      />

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-800">Tipo de sala</label>
        <div className="grid gap-3 sm:grid-cols-2">
          <TypeOption
            active={form.tipo === 'texto'}
            icon="text"
            title="Solo texto"
            description="Conversacion rapida sin subida de archivos."
            onClick={() => set('tipo', 'texto')}
          />
          <TypeOption
            active={form.tipo === 'multimedia'}
            icon="file"
            title="Multimedia"
            description="Permite imagenes y documentos controlados."
            onClick={() => set('tipo', 'multimedia')}
          />
        </div>
      </div>

      <div className={`grid gap-4 ${form.tipo === 'multimedia' ? 'sm:grid-cols-2' : ''}`}>
        {form.tipo === 'multimedia' && (
          <Input
            label="Tamano maximo (MB)"
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
      </div>

      <Input
        label="Maximo de usuarios"
        type="number"
        value={form.max_usuarios}
        onChange={(e) => set('max_usuarios', e.target.value)}
        min={1}
        max={50}
        required
        placeholder="1-50"
      />

      <Button type="submit" loading={loading} className="w-full py-3 text-sm font-bold">
        Crear sala
      </Button>
    </form>
  );
}
