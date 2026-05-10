import { calcFingerprint } from '../utils/fingerprint.js';

const DEVICE_KEY = 'swr_device_id';
const SESSION_KEY = 'swr_session_token';
const SALA_KEY = 'swr_sala_id';
const NICKNAME_KEY = 'swr_nickname';

export function getDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export async function getFingerprint() {
  return calcFingerprint();
}

export function saveSession(sessionToken, salaId, nickname) {
  localStorage.setItem(SESSION_KEY, sessionToken);
  localStorage.setItem(SALA_KEY, salaId);
  if (nickname) localStorage.setItem(NICKNAME_KEY, nickname);
}

export function getNickname() {
  return localStorage.getItem(NICKNAME_KEY) ?? '';
}

export function getSessionToken() {
  return localStorage.getItem(SESSION_KEY);
}

export function getSalaId() {
  return localStorage.getItem(SALA_KEY);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SALA_KEY);
  localStorage.removeItem(NICKNAME_KEY);
}
