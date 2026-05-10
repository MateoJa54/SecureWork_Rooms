import config from '../../vite.config.js';

describe('vite.config.js', () => {
  test('config existe', () => {
    expect(config).toBeDefined();
  });

  test('plugins configurados', () => {
    expect(config.plugins).toBeDefined();
    expect(Array.isArray(config.plugins)).toBe(true);
    expect(config.plugins.length).toBeGreaterThan(0);
  });

  test('resolve alias configurado', () => {
    expect(config.resolve).toBeDefined();

    expect(config.resolve.alias).toBeDefined();

    expect(config.resolve.alias['@']).toContain('src');
  });

  test('server configurado', () => {
    expect(config.server).toBeDefined();

    expect(config.server.host).toBe('0.0.0.0');

    expect(config.server.port).toBe(5173);

    expect(config.server.watch).toBeDefined();

    expect(config.server.watch.usePolling).toBe(true);
  });

  test('test environment configurado', () => {
    expect(config.test).toBeDefined();

    expect(config.test.globals).toBe(true);

    expect(config.test.environment).toBe('jsdom');

    expect(config.test.setupFiles).toContain('./src/tests/setup.js');
  });

  test('coverage configurado', () => {
    expect(config.test.coverage).toBeDefined();

    expect(config.test.coverage.provider).toBe('v8');

    expect(config.test.coverage.reporter).toContain('text');

    expect(config.test.coverage.reporter).toContain('html');

    expect(config.test.coverage.reportsDirectory).toBe('./coverage');

    expect(config.test.coverage.exclude).toContain('node_modules/');

    expect(config.test.coverage.exclude).toContain('src/tests/');

    expect(config.test.coverage.exclude).toContain('dist/');
  });
});