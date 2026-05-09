import React from 'react';
import {
  describe,
  it,
  expect,
} from 'vitest';

import { renderHook } from '@testing-library/react';

import { useAuth } from '../../hooks/useAuth.js';
import { AuthContext } from '../../context/AuthContext.jsx';

describe('useAuth hook', () => {
  it('should return auth context', () => {
    const wrapper = ({ children }) => (
      <AuthContext.Provider
        value={{ user: 'Eduardo' }}
      >
        {children}
      </AuthContext.Provider>
    );

    const { result } = renderHook(
      () => useAuth(),
      { wrapper }
    );

    expect(result.current.user).toBe(
      'Eduardo'
    );
  });

  it('should throw error without provider', () => {
    expect(() =>
      renderHook(() => useAuth())
    ).toThrow(
      'useAuth debe usarse dentro de <AuthProvider>'
    );
  });
});