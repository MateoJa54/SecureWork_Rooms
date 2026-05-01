async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function generarFingerprint() {
  const nav = navigator;
  const attrs = [
    nav.userAgent,
    nav.language,
    nav.platform,
    String(screen.width),
    String(screen.height),
    String(screen.colorDepth),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    String(nav.hardwareConcurrency ?? ''),
    String(nav.deviceMemory ?? ''),
  ].join('|');

  return sha256(attrs);
}
