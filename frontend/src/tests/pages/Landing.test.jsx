import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Landing from '../../pages/Landing';

// mock Button para simplificar el test
vi.mock('../../components/common/Button.jsx', () => ({
  default: ({ children }) => <button>{children}</button>,
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <Landing />
    </MemoryRouter>
  );

describe('Landing page', () => {
  it('should render main title and description', () => {
    renderPage();

    expect(
      screen.getByText(/securework rooms/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/salas de chat seguras/i)
    ).toBeInTheDocument();
  });

  it('should render action buttons', () => {
    renderPage();

    expect(
      screen.getByText(/unirse a una sala/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/administrar/i)
    ).toBeInTheDocument();
  });

  it('should render help text', () => {
    renderPage();

    expect(
      screen.getByText(/pide el pin al administrador/i)
    ).toBeInTheDocument();
  });

  it('should have navigation links', () => {
    renderPage();

    const joinLink = screen.getByText(/unirse a una sala/i).closest('a');
    const adminLink = screen.getByText(/administrar/i).closest('a');

    expect(joinLink).toHaveAttribute('href', '/unirse');
    expect(adminLink).toHaveAttribute('href', '/admin/login');
  });
});