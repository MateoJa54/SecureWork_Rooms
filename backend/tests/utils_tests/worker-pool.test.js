jest.mock('worker_threads', () => {

  class MockWorker {

    constructor(script) {
      this.script = script;
      this._ocupado = false;
      this.events = {};
      this.postMessage = jest.fn();
      this.terminate = jest.fn(() => Promise.resolve());
    }

    on(event, callback) {
      this.events[event] = callback;
    }

  }

  return {
    Worker: MockWorker,
  };
});

const WorkerPool = require('../../src/utils/worker-pool');

describe('WorkerPool Utils', () => {

  let pool;

  beforeEach(() => {
    jest.clearAllMocks();

    pool = new WorkerPool('fake-worker.js', 2);
  });

  // crear pool correctamente
  test('debe crear workers correctamente', () => {
    expect(pool._workers.length).toBe(2);
  });

  // ejecutar tarea directamente
  test('debe ejecutar tarea en worker libre', async () => {
    const worker = pool._workers[0];

    const promise = pool.ejecutar('hash', {
      plaintext: '1234',
    });

    expect(worker.postMessage).toHaveBeenCalled();

    const call = worker.postMessage.mock.calls[0][0];

    worker.events.message({
      id: call.id,
      result: 'hashed',
    });

    const result = await promise;

    expect(result).toBe('hashed');
  });

  // manejar error desde worker
  test('debe manejar error del worker', async () => {
    const worker = pool._workers[0];

    const promise = pool.ejecutar('hash', {
      plaintext: '1234',
    });

    const call = worker.postMessage.mock.calls[0][0];

    worker.events.message({
      id: call.id,
      error: 'worker fail',
    });

    await expect(promise)
      .rejects
      .toThrow('worker fail');
  });

  // agregar tareas a cola
  test('debe agregar tareas a la cola si workers ocupados', async () => {

    pool._workers.forEach((w) => {
      w._ocupado = true;
    });

    const promise = pool.ejecutar('hash', {
      plaintext: '1234',
    });

    expect(pool._queue.length).toBe(1);

    const worker = pool._workers[0];

    worker._ocupado = false;

    pool._procesarCola();

    expect(worker.postMessage).toHaveBeenCalled();

    const call = worker.postMessage.mock.calls[0][0];

    worker.events.message({
      id: call.id,
      result: 'ok',
    });

    const result = await promise;

    expect(result).toBe('ok');
  });

  // no procesar cola vacía
  test('debe ignorar cola vacia', () => {
    expect(() => {
      pool._procesarCola();
    }).not.toThrow();
  });

  // no procesar si no hay worker libre
  test('debe ignorar cola si no hay workers libres', () => {

    pool._workers.forEach((w) => {
      w._ocupado = true;
    });

    pool._queue.push({
      id: 1,
      type: 'hash',
      payload: {},
      resolve: jest.fn(),
      reject: jest.fn(),
    });

    pool._procesarCola();

    expect(pool._queue.length).toBe(1);
  });

  // manejar evento error
  test('debe manejar evento error del worker', () => {
    const worker = pool._workers[0];

    const spy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    worker.events.error(new Error('fatal error'));

    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });

  // terminar workers
  test('debe terminar todos los workers', async () => {

    await pool.terminar();

    for (const worker of pool._workers) {
      expect(worker.terminate).toHaveBeenCalled();
    }
  });

});