import axios from 'axios';
import { supabase } from './supabase.client.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api',
});

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err.response?.data;
    const message = data?.mensaje ?? data?.error ?? err.message;
    const apiError = new Error(message);

    apiError.codigo = data?.codigo;
    apiError.status = err.response?.status;

    return Promise.reject(apiError);
  }
);

export default api;
