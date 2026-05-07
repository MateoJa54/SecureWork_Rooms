describe('Logger', () => {

  let logSpy;
  let warnSpy;
  let errorSpy;

  beforeEach(() => {
    jest.resetModules();

    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // prueba: info en desarrollo
  test('debe ejecutar console.log en entorno desarrollo', () => {

    process.env.NODE_ENV = 'development';

    const logger = require('../../src/config/logger');

    logger.info('mensaje info');

    expect(logSpy).toHaveBeenCalledWith(
      '[INFO]',
      'mensaje info'
    );
  });

  // prueba: info en producción
  test('no debe ejecutar console.log en producción', () => {

    process.env.NODE_ENV = 'production';

    const logger = require('../../src/config/logger');

    logger.info('mensaje oculto');

    expect(logSpy).not.toHaveBeenCalled();
  });

  // prueba: warn
  test('debe ejecutar console.warn', () => {

    const logger = require('../../src/config/logger');

    logger.warn('mensaje warn');

    expect(warnSpy).toHaveBeenCalledWith(
      '[WARN]',
      'mensaje warn'
    );
  });

  // prueba: error
  test('debe ejecutar console.error', () => {

    const logger = require('../../src/config/logger');

    logger.error('mensaje error');

    expect(errorSpy).toHaveBeenCalledWith(
      '[ERROR]',
      'mensaje error'
    );
  });

});