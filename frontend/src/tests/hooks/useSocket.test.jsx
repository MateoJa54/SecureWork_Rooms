import React from 'react';
import {
  describe,
  it,
  expect,
} from 'vitest';

import { renderHook } from '@testing-library/react';

import { useSocket } from '../../hooks/useSocket.js';
import { SocketContext } from '../../context/SocketContext.jsx';

describe('useSocket hook', () => {
  it('should return socket context', () => {
    const wrapper = ({ children }) => (
      <SocketContext.Provider
        value={{ connected: true }}
      >
        {children}
      </SocketContext.Provider>
    );

    const { result } = renderHook(
      () => useSocket(),
      { wrapper }
    );

    expect(
      result.current.connected
    ).toBe(true);
  });

  it('should throw error without provider', () => {
    expect(() =>
      renderHook(() => useSocket())
    ).toThrow(
      'useSocket debe usarse dentro de <SocketProvider>'
    );
  });
});