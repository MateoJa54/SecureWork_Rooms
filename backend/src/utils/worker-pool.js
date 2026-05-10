// TICKET-009 — Pool de Worker Threads reutilizables (sección 12.3 del documento)
'use strict';

const os = require('os');
const { Worker } = require('worker_threads');

class WorkerPool {
  constructor(workerScript, size = Math.max(1, os.cpus().length - 1)) {
    this._script = workerScript;
    this._workers = [];
    this._queue = [];
    this._pendientes = new Map();
    this._nextId = 1;

    for (let i = 0; i < size; i++) {
      this._crearWorker();
    }
  }

  _crearWorker() {
    const worker = new Worker(this._script);
    worker._ocupado = false;
    worker._tareaActual = null;

    worker.on('message', ({ id, result, error }) => {
      const { resolve, reject } = this._pendientes.get(id) || {};
      this._pendientes.delete(id);
      worker._ocupado = false;
      worker._tareaActual = null;
      if (error) {
        if (reject) reject(new Error(error));
      } else {
        if (resolve) resolve(result);
      }
      this._procesarCola();
    });

    worker.on('error', (err) => {
      console.error('[WorkerPool] Worker error:', err.message);
      this._fallarWorker(worker, err);
    });

    worker.on('exit', (code) => {
      this._workers = this._workers.filter((w) => w !== worker);
      if (code !== 0) {
        this._fallarWorker(worker, new Error(`Worker finalizado con codigo ${code}`));
      }
      this._rechazarColaSiNoHayWorkers();
      this._procesarCola();
    });

    this._workers.push(worker);
  }

  _fallarWorker(worker, err) {
    if (worker._tareaActual) {
      const { reject } = this._pendientes.get(worker._tareaActual) || {};
      this._pendientes.delete(worker._tareaActual);
      worker._tareaActual = null;
      if (reject) reject(err);
    }
    worker._ocupado = true;
  }

  _rechazarColaSiNoHayWorkers() {
    if (this._workers.length > 0) return;
    while (this._queue.length > 0) {
      const { reject } = this._queue.shift();
      reject(new Error('No hay workers disponibles'));
    }
  }

  _procesarCola() {
    if (this._queue.length === 0) return;
    const libre = this._workers.find((w) => !w._ocupado);
    if (!libre) return;
    const { id, type, payload, resolve, reject } = this._queue.shift();
    this._pendientes.set(id, { resolve, reject });
    libre._ocupado = true;
    libre._tareaActual = id;
    libre.postMessage({ id, type, payload });
  }

  ejecutar(type, payload) {
    return new Promise((resolve, reject) => {
      if (this._workers.length === 0) {
        reject(new Error('No hay workers disponibles'));
        return;
      }

      const id = this._nextId++;
      const libre = this._workers.find((w) => !w._ocupado);
      if (libre) {
        this._pendientes.set(id, { resolve, reject });
        libre._ocupado = true;
        libre._tareaActual = id;
        libre.postMessage({ id, type, payload });
      } else {
        this._queue.push({ id, type, payload, resolve, reject });
      }
    });
  }

  async terminar() {
    await Promise.all(this._workers.map((w) => w.terminate()));
  }
}

module.exports = WorkerPool;
