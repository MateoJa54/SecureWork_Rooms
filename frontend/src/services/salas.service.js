import api from './api.js';

export async function listarSalas() {
  const { data } = await api.get('/salas');
  return data;
}

export async function obtenerSala(id) {
  const { data } = await api.get(`/salas/${id}`);
  return data;
}

export async function crearSala(payload) {
  const { data } = await api.post('/salas', payload);
  return data;
}

export async function eliminarSala(id) {
  await api.delete(`/salas/${id}`);
}

export async function expulsarUsuario(salaId, nickname) {
  await api.delete(`/salas/${salaId}/usuarios/${encodeURIComponent(nickname)}`);
}

export async function unirseSala(payload) {
  const { data } = await api.post('/salas/unirse', payload);
  return data;
}

export async function subirArchivo(salaId, file, sessionToken) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post(`/salas/${salaId}/archivos`, form, {
    headers: {
      'X-Session-Token': sessionToken,
    },
  });
  return data;
}

export async function obtenerArchivoBlob(archivoId, sessionToken) {
  const { data } = await api.get(`/archivos/${archivoId}`, {
    responseType: 'blob',
    headers: {
      'X-Session-Token': sessionToken,
    },
  });
  return data;
}
