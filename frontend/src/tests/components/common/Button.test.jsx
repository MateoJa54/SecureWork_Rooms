import {
  describe,
  it,
  expect,
  vi,
} from 'vitest';

import {
  render,
  screen,
  fireEvent,
} from '@testing-library/react';

import Button from '../../../components/common/Button.jsx';

describe('Button component', () => {
  it('should render children correctly', () => {
    render(
      <Button>
        Click Me
      </Button>
    );

    expect(
      screen.getByText('Click Me')
    ).toBeInTheDocument();
  });

  it('should render loading state', () => {
    render(
      <Button loading>
        Save
      </Button>
    );

    expect(
      screen.getByText('Cargando...')
    ).toBeInTheDocument();
  });

  it('should apply primary variant by default', () => {
    render(
      <Button>
        Default
      </Button>
    );

    const button = screen.getByRole(
      'button'
    );

    expect(button.className).toContain(
      'btn-primary'
    );
  });

  it('should apply secondary variant', () => {
    render(
      <Button variant="secondary">
        Secondary
      </Button>
    );

    const button = screen.getByRole(
      'button'
    );

    expect(button.className).toContain(
      'btn-secondary'
    );
  });

  it('should apply danger variant', () => {
    render(
      <Button variant="danger">
        Delete
      </Button>
    );

    const button = screen.getByRole(
      'button'
    );

    expect(button.className).toContain(
      'btn-danger'
    );
  });

  it('should handle click event', () => {
    const onClick = vi.fn();

    render(
      <Button onClick={onClick}>
        Click
      </Button>
    );

    fireEvent.click(
      screen.getByText('Click')
    );

    expect(onClick).toHaveBeenCalled();
  });

  it('should be disabled when loading', () => {
    render(
      <Button loading>
        Loading
      </Button>
    );

    expect(
      screen.getByRole('button')
    ).toBeDisabled();
  });
});