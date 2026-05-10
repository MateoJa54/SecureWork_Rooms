import { vi, test, expect } from 'vitest';

const renderMock = vi.fn();

vi.mock('react-dom/client', () => ({
  default: {
    createRoot: vi.fn(() => ({
      render: renderMock,
    })),
  },
  createRoot: vi.fn(() => ({
    render: renderMock,
  })),
}));

vi.mock('../App.jsx', () => ({
  default: () => <div>App Component</div>,
}));

test('main.jsx renderiza App correctamente', async () => {
  document.body.innerHTML = '<div id="root"></div>';

  await import('../main.jsx');

  expect(renderMock).toHaveBeenCalled();
});