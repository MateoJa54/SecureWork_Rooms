import {
  describe,
  it,
  expect,
} from 'vitest';

import {
  render,
  screen,
} from '@testing-library/react';

import Input from '../../../components/common/Input.jsx';

describe('Input component', () => {
  it('should render label correctly', () => {
    render(
      <Input label="Email" />
    );

    expect(
      screen.getByText('Email')
    ).toBeInTheDocument();
  });

  it('should render error message', () => {
    render(
      <Input error="Required field" />
    );

    expect(
      screen.getByText(
        'Required field'
      )
    ).toBeInTheDocument();
  });

  it('should apply error styles', () => {
    render(
      <Input error="Invalid" />
    );

    const input = screen.getByRole(
      'textbox'
    );

    expect(input.className).toContain(
      'border-red-500'
    );
  });

  it('should apply custom className', () => {
    render(
      <Input className="custom-class" />
    );

    const input = screen.getByRole(
      'textbox'
    );

    expect(input.className).toContain(
      'custom-class'
    );
  });

  it('should render input correctly without label or error', () => {
    render(<Input />);

    expect(
      screen.getByRole('textbox')
    ).toBeInTheDocument();
  });
});