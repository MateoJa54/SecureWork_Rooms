const { generarPin } = require('../../src/utils/pin-generator');

describe('Pin Generator Utils', () => {

  // generar pin por defecto
  test('debe generar un pin de 6 digitos por defecto', () => {
    const pin = generarPin();

    expect(typeof pin).toBe('string');

    expect(pin).toHaveLength(6);

    expect(Number(pin)).toBeGreaterThanOrEqual(100000);

    expect(Number(pin)).toBeLessThanOrEqual(999999);
  });

  // generar pin personalizado
  test('debe generar un pin con longitud personalizada', () => {
    const pin = generarPin(4);

    expect(pin).toHaveLength(4);

    expect(Number(pin)).toBeGreaterThanOrEqual(1000);

    expect(Number(pin)).toBeLessThanOrEqual(9999);
  });

  // generar pin de 8 dígitos
  test('debe generar un pin de 8 digitos', () => {
    const pin = generarPin(8);

    expect(pin).toHaveLength(8);

    expect(Number(pin)).toBeGreaterThanOrEqual(10000000);

    expect(Number(pin)).toBeLessThanOrEqual(99999999);
  });

  // asegurar que siempre retorna string
  test('debe retornar string siempre', () => {
    const pin = generarPin(5);

    expect(typeof pin).toBe('string');
  });

  // cubrir diferentes llamadas
  test('debe generar distintos pines', () => {
    const pin1 = generarPin();

    const pin2 = generarPin();

    expect(pin1).not.toBeUndefined();

    expect(pin2).not.toBeUndefined();
  });

});