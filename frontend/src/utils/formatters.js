export function formatFecha(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatHora(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

export function formatFechaLarga(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatTipoSala(tipo) {
  return tipo === 'multimedia' ? 'Multimedia' : 'Solo texto';
}

export function getTipoSala(sala) {
  return sala?.tipo_sala ?? sala?.tipo ?? 'texto';
}

export function isSalaMultimedia(sala) {
  return getTipoSala(sala) === 'multimedia';
}

export function getTimeoutMinutos(sala) {
  return sala?.timeout_inactividad_min ?? sala?.timeout_min ?? sala?.timeout_inactividad ?? 0;
}

export function getMaxArchivoMb(sala) {
  return sala?.max_file_size_mb ?? sala?.tamanio_max_archivo_mb ?? sala?.max_size_mb ?? null;
}

export function getFechaCreacion(sala) {
  return sala?.creada_en ?? sala?.creado_en ?? sala?.created_at;
}
