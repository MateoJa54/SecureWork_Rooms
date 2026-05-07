describe('Configuración de entorno', () => {

  beforeEach(() => {
    jest.resetModules();

    delete process.env.PORT;
    delete process.env.DB_PORT;
    delete process.env.MAX_FILE_SIZE_MB;
    delete process.env.HOST;
    delete process.env.DB_HOST;
    delete process.env.DB_NAME;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    delete process.env.SESSION_TOKEN_SECRET;
    delete process.env.CORS_ORIGIN;
    delete process.env.UPLOAD_DIR;
  });

  // prueba: valores por defecto
  test('debe cargar valores por defecto cuando no existen variables de entorno', () => {

    const config = require('../../src/config/env');

    expect(config.PORT).toBe(3000);
    expect(config.DB_PORT).toBe(5432);
    expect(config.MAX_FILE_SIZE_MB).toBe(10);
    expect(config.HOST).toBe('0.0.0.0');
    expect(config.DB_NAME).toBe('securework');
    expect(config.DB_USER).toBe('securework_user');
  });

  // prueba: variables personalizadas
  test('debe usar variables de entorno personalizadas', () => {

    process.env.NODE_ENV = 'test';
    process.env.PORT = '5000';
    process.env.DB_PORT = '9999';
    process.env.MAX_FILE_SIZE_MB = '20';
    process.env.HOST = '127.0.0.1';
    process.env.DB_HOST = 'mi_host';
    process.env.DB_NAME = 'mi_db';
    process.env.DB_USER = 'mi_user';
    process.env.DB_PASSWORD = '123456';
    process.env.SUPABASE_URL = 'http://test';
    process.env.SUPABASE_ANON_KEY = 'clave';
    process.env.SESSION_TOKEN_SECRET = 'secret';
    process.env.CORS_ORIGIN = 'http://localhost';
    process.env.UPLOAD_DIR = '/tmp/uploads';

    jest.resetModules();

    const config = require('../../src/config/env');

    expect(config.NODE_ENV).toBe('test');
    expect(config.PORT).toBe(5000);
    expect(config.DB_PORT).toBe(9999);
    expect(config.MAX_FILE_SIZE_MB).toBe(20);
    expect(config.HOST).toBe('127.0.0.1');
    expect(config.DB_HOST).toBe('mi_host');
    expect(config.DB_NAME).toBe('mi_db');
    expect(config.DB_USER).toBe('mi_user');
    expect(config.DB_PASSWORD).toBe('123456');
    expect(config.SUPABASE_URL).toBe('http://test');
    expect(config.SUPABASE_ANON_KEY).toBe('clave');
    expect(config.SESSION_TOKEN_SECRET).toBe('secret');
    expect(config.CORS_ORIGIN).toBe('http://localhost');
    expect(config.UPLOAD_DIR).toBe('/tmp/uploads');
  });

});