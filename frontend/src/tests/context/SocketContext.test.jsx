import React from 'react';

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from 'vitest';

import {
  render,
  screen,
  fireEvent,
} from '@testing-library/react';

const mockConectar = vi.fn();
const mockDesconectar = vi.fn();
const mockGetSocket = vi.fn();

vi.mock('../../services/socket.service.js', () => ({
  conectar: mockConectar,
  desconectar: mockDesconectar,
  getSocket: mockGetSocket,
}));

describe('SocketContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should connect socket correctly', async () => {
    const onMock = vi.fn();

    const fakeSocket = {
      on: onMock,
    };

    mockConectar.mockReturnValue(
      fakeSocket
    );

    mockGetSocket.mockReturnValue(
      fakeSocket
    );

    const {
      SocketProvider,
      SocketContext,
    } = await import(
      '../../context/SocketContext.jsx'
    );

    function TestComponent() {
      return (
        <SocketContext.Consumer>
          {(value) => (
            <button
              onClick={() =>
                value.connect(
                  'token123'
                )
              }
            >
              Connect
            </button>
          )}
        </SocketContext.Consumer>
      );
    }

    render(
      <SocketProvider>
        <TestComponent />
      </SocketProvider>
    );

    fireEvent.click(
      screen.getByText('Connect')
    );

    expect(
      mockConectar
    ).toHaveBeenCalledWith(
      'token123'
    );

    expect(onMock).toHaveBeenCalledTimes(2);
  });

  it('should disconnect socket correctly', async () => {
    mockGetSocket.mockReturnValue(
      null
    );

    const {
      SocketProvider,
      SocketContext,
    } = await import(
      '../../context/SocketContext.jsx'
    );

    function TestComponent() {
      return (
        <SocketContext.Consumer>
          {(value) => (
            <button
              onClick={() =>
                value.disconnect()
              }
            >
              Disconnect
            </button>
          )}
        </SocketContext.Consumer>
      );
    }

    render(
      <SocketProvider>
        <TestComponent />
      </SocketProvider>
    );

    fireEvent.click(
      screen.getByText('Disconnect')
    );

    expect(
      mockDesconectar
    ).toHaveBeenCalled();
  });
});