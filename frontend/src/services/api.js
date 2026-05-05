import axios from 'axios';
import { supabase } from './supabase.client.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
});

api.interceptors.request.use(async (config) => {
  // Rutas públicas que NO necesitan autenticación
  const url = config.url || '';
  const isPublicRoute = url.includes('unirse');
  
  // Solo agregar token si NO es ruta pública
  if (!isPublicRoute) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (err) {
      // Si hay error obteniendo la sesión, continuar sin token
      console.warn('[API] Error obteniendo sesión:', err.message);
    }
  }
  
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error ?? err.message;
    return Promise.reject(new Error(message));
  }
);

export default api;
