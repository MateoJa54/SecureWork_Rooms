import config from '../../tailwind.config.js';

describe('tailwind.config', () => {
  test('debe tener content configurado', () => {
    expect(config.content).toContain('./index.html');
  });

  test('debe tener colores primary', () => {
    expect(config.theme.extend.colors.primary[500]).toBe('#3b82f6');
    expect(config.theme.extend.colors.primary[900]).toBe('#1e3a8a');
  });

  test('plugins debe ser array', () => {
    expect(Array.isArray(config.plugins)).toBe(true);
  });
});