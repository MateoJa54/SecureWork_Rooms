import config from '../../postcss.config.js';

describe('postcss.config', () => {
  test('debe tener tailwindcss', () => {
    expect(config.plugins.tailwindcss).toBeDefined();
  });

  test('debe tener autoprefixer', () => {
    expect(config.plugins.autoprefixer).toBeDefined();
  });
});