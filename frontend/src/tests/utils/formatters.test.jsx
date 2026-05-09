import {
  describe,
  it,
  expect,
} from 'vitest';

import {
  formatFecha,
  formatHora,
  formatBytes,
  formatTipoSala,
} from '../../utils/formatters.js';

describe('formatters utils', () => {
  it('should format fecha correctly', () => {
    const result = formatFecha(
      '2026-01-01T10:30:00'
    );

    expect(result).toContain('01');
  });

  it('should return empty string for invalid fecha', () => {
    expect(formatFecha()).toBe('');
  });

  it('should format hora correctly', () => {
    const result = formatHora(
      '2026-01-01T10:30:00'
    );

    expect(result).toContain('10');
  });

  it('should return empty string for invalid hora', () => {
    expect(formatHora()).toBe('');
  });

  it('should format bytes correctly', () => {
    expect(formatBytes(1024)).toBe('1 KB');
  });

  it('should return 0 B for zero bytes', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('should format multimedia sala type', () => {
    expect(
      formatTipoSala('multimedia')
    ).toBe('Multimedia');
  });

  it('should format text sala type', () => {
    expect(
      formatTipoSala('texto')
    ).toBe('Solo texto');
  });
});