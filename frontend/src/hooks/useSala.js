import { useState, useEffect, useCallback } from 'react';
import { obtenerSala } from '../services/salas.service.js';

export function useSala(id) {
  const [sala, setSala] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async ({ silent = false } = {}) => {
    if (!id) return;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await obtenerSala(id);
      setSala(data);
    } catch (err) {
      setError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { sala, loading, error, recargar: cargar };
}
