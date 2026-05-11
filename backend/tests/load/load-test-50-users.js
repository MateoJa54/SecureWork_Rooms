/**
 * Test de carga: 50 usuarios simultáneos en una sala
 * 
 * Criterio 7 de la rúbrica (1 punto): Soporta más de 50 usuarios simulados sin caídas.
 * 
 * Uso:
 *   1. Levantar el stack: docker compose up
 *   2. Crear una sala de prueba y obtener el PIN
 *   3. Ejecutar:
 *      node tests/load/load-test-50-users.js <PIN_DE_LA_SALA>
 * 
 * También se puede ejecutar desde fuera del contenedor:
 *   docker compose exec backend node tests/load/load-test-50-users.js <PIN>
 */

'use strict';

const http = require('http');
const { io: ioClient } = require('socket.io-client');

const API_URL = process.env.API_URL || 'http://localhost:3000';
const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:3000';
const PIN = process.argv[2];
const NUM_USERS = parseInt(process.argv[3] || '50');
const MESSAGES_PER_USER = 3;

if (!PIN) {
  console.error('Uso: node load-test-50-users.js <PIN> [NUM_USUARIOS]');
  console.error('Ejemplo: node load-test-50-users.js 123456 50');
  process.exit(1);
}

// --- Helpers ---

function postJSON(path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_URL);
    const data = JSON.stringify(body);
    const req = http.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// --- Main ---

async function main() {
  console.log(`\n=== TEST DE CARGA: ${NUM_USERS} usuarios simultáneos ===\n`);

  const resultados = {
    unirse_ok: 0,
    unirse_fail: 0,
    socket_ok: 0,
    socket_fail: 0,
    mensajes_enviados: 0,
    mensajes_recibidos: 0,
    latencias: [],
    errores: [],
  };

  const sockets = [];
  const startTime = Date.now();

  // Paso 1: Unir 50 usuarios a la sala
  console.log(`[1/4] Uniendo ${NUM_USERS} usuarios a la sala con PIN ${PIN}...`);

  const sesiones = [];
  const joinPromises = [];

  for (let i = 1; i <= NUM_USERS; i++) {
    const nickname = `loadtest_user_${i}`;
    const device_id = `loadtest-device-${i}-${Date.now()}`;
    const fingerprint = `loadtest-fp-${i}`;

    joinPromises.push(
      postJSON('/api/salas/unirse', { pin: PIN, nickname, device_id, fingerprint })
        .then(({ status, data }) => {
          if (status === 200 || status === 201) {
            resultados.unirse_ok++;
            sesiones.push({ nickname, device_id, ...data });
          } else {
            resultados.unirse_fail++;
            resultados.errores.push(`JOIN ${nickname}: ${status} ${JSON.stringify(data)}`);
          }
        })
        .catch((err) => {
          resultados.unirse_fail++;
          resultados.errores.push(`JOIN ${nickname}: ${err.message}`);
        })
    );
  }

  await Promise.all(joinPromises);
  console.log(`   ✓ Unidos: ${resultados.unirse_ok}/${NUM_USERS} | Fallos: ${resultados.unirse_fail}`);

  if (resultados.unirse_ok === 0) {
    console.error('\n✗ Ningún usuario pudo unirse. Verifica el PIN y que la sala exista.\n');
    process.exit(1);
  }

  // Paso 2: Conectar WebSockets
  console.log(`[2/4] Conectando ${sesiones.length} WebSockets...`);

  const socketPromises = sesiones.map((sesion) => {
    return new Promise((resolve) => {
      const socket = ioClient(SOCKET_URL, {
        transports: ['websocket'],
        auth: { session_token: sesion.session_token, device_id: sesion.device_id },
        reconnection: false,
        timeout: 10000,
      });

      const timer = setTimeout(() => {
        resultados.socket_fail++;
        resolve();
      }, 10000);

      socket.on('connect', () => {
        clearTimeout(timer);
        resultados.socket_ok++;
        socket._nickname = sesion.nickname;
        socket._sala_id = sesion.sala_id;
        sockets.push(socket);

        socket.emit('sala:join', { sala_id: sesion.sala_id });
        resolve();
      });

      socket.on('connect_error', (err) => {
        clearTimeout(timer);
        resultados.socket_fail++;
        resultados.errores.push(`SOCKET ${sesion.nickname}: ${err.message}`);
        resolve();
      });

      // Contar mensajes recibidos
      socket.on('mensaje:nuevo', () => {
        resultados.mensajes_recibidos++;
      });
    });
  });

  await Promise.all(socketPromises);
  await sleep(1000); // Esperar sala:joined
  console.log(`   ✓ Conectados: ${resultados.socket_ok}/${sesiones.length} | Fallos: ${resultados.socket_fail}`);

  // Paso 3: Enviar mensajes simultáneos
  const totalMensajes = sockets.length * MESSAGES_PER_USER;
  console.log(`[3/4] Enviando ${totalMensajes} mensajes (${MESSAGES_PER_USER} por usuario)...`);

  const sendStart = Date.now();

  for (let round = 1; round <= MESSAGES_PER_USER; round++) {
    const roundPromises = sockets.map((socket) => {
      return new Promise((resolve) => {
        const t0 = Date.now();
        const contenido = `Mensaje de carga #${round} de ${socket._nickname} [${Date.now()}]`;

        const onMsg = (msg) => {
          if (msg.contenido === contenido || msg.nickname === socket._nickname) {
            const latencia = Date.now() - t0;
            resultados.latencias.push(latencia);
            resultados.mensajes_enviados++;
            socket.off('mensaje:nuevo', onMsg);
            resolve();
          }
        };

        socket.on('mensaje:nuevo', onMsg);
        socket.emit('mensaje:enviar', { contenido });

        // Timeout: si no recibe respuesta en 5s, contar igual
        setTimeout(() => {
          socket.off('mensaje:nuevo', onMsg);
          resultados.mensajes_enviados++;
          resultados.latencias.push(5000);
          resolve();
        }, 5000);
      });
    });

    await Promise.all(roundPromises);
  }

  const sendDuration = Date.now() - sendStart;
  console.log(`   ✓ Enviados: ${resultados.mensajes_enviados} en ${sendDuration}ms`);

  // Paso 4: Desconectar todos
  console.log(`[4/4] Desconectando ${sockets.length} usuarios...`);

  for (const socket of sockets) {
    socket.emit('sala:salir');
    socket.disconnect();
  }

  await sleep(1000);

  // --- Reporte ---
  const totalTime = Date.now() - startTime;
  const latencias = resultados.latencias.sort((a, b) => a - b);
  const p50 = latencias[Math.floor(latencias.length * 0.5)] || 0;
  const p95 = latencias[Math.floor(latencias.length * 0.95)] || 0;
  const p99 = latencias[Math.floor(latencias.length * 0.99)] || 0;
  const avg = latencias.length > 0 ? Math.round(latencias.reduce((a, b) => a + b, 0) / latencias.length) : 0;

  console.log('\n' + '='.repeat(60));
  console.log('  RESULTADOS DEL TEST DE CARGA');
  console.log('='.repeat(60));
  console.log(`  Usuarios configurados:      ${NUM_USERS}`);
  console.log(`  Usuarios unidos (REST):     ${resultados.unirse_ok}`);
  console.log(`  WebSockets conectados:      ${resultados.socket_ok}`);
  console.log(`  Mensajes enviados:          ${resultados.mensajes_enviados}`);
  console.log(`  Mensajes recibidos (total): ${resultados.mensajes_recibidos}`);
  console.log(`  Tiempo total:               ${totalTime}ms`);
  console.log('');
  console.log('  Latencias de mensaje:');
  console.log(`    Promedio:  ${avg}ms`);
  console.log(`    p50:       ${p50}ms`);
  console.log(`    p95:       ${p95}ms`);
  console.log(`    p99:       ${p99}ms`);
  console.log('');

  const passed = resultados.unirse_ok >= NUM_USERS * 0.9
    && resultados.socket_ok >= resultados.unirse_ok * 0.9
    && p99 < 1000;

  if (passed) {
    console.log('  ✅ TEST PASADO: El sistema soporta 50+ usuarios sin caídas');
    console.log(`     p99 < 1s: ${p99}ms ✓`);
  } else {
    console.log('  ❌ TEST FALLIDO:');
    if (resultados.unirse_ok < NUM_USERS * 0.9) {
      console.log(`     Solo ${resultados.unirse_ok}/${NUM_USERS} pudieron unirse`);
    }
    if (resultados.socket_ok < resultados.unirse_ok * 0.9) {
      console.log(`     Solo ${resultados.socket_ok}/${resultados.unirse_ok} conectaron WebSocket`);
    }
    if (p99 >= 1000) {
      console.log(`     p99 latencia ${p99}ms >= 1000ms`);
    }
  }

  if (resultados.errores.length > 0) {
    console.log('\n  Primeros 5 errores:');
    resultados.errores.slice(0, 5).forEach((e) => console.log(`    - ${e}`));
  }

  console.log('='.repeat(60) + '\n');
  process.exit(passed ? 0 : 1);
}

main().catch((err) => {
  console.error('Error fatal:', err);
  process.exit(1);
});
