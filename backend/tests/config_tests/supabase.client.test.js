describe('Cliente Supabase', () => {

  let createClientMock;

  beforeEach(() => {

    jest.resetModules();

    createClientMock = jest.fn(() => ({
      auth: {},
    }));

    jest.doMock('@supabase/supabase-js', () => ({
      createClient: createClientMock,
    }));

    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;

    jest.spyOn(console, 'warn')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // prueba: valores por defecto
  test('debe usar valores por defecto y mostrar warning', () => {

    require('../../src/config/supabase.client');

    expect(console.warn).toHaveBeenCalledWith(
      '[Supabase] SUPABASE_URL o SUPABASE_ANON_KEY no configurados'
    );

    expect(createClientMock).toHaveBeenCalledWith(
      'http://localhost',
      'placeholder'
    );
  });

  // prueba: variables configuradas
  test('debe crear cliente con variables de entorno', () => {

    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_ANON_KEY = 'clave-test';

    require('../../src/config/supabase.client');

    expect(console.warn).not.toHaveBeenCalled();

    expect(createClientMock).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'clave-test'
    );
  });

});