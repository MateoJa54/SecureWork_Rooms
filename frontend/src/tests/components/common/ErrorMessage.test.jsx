import {
  describe,
  it,
  expect,
} from 'vitest';

import {
  render,
  screen,
} from '@testing-library/react';

import ErrorMessage from '../../../components/common/ErrorMessage.jsx';

describe('ErrorMessage component', () => {
  it('should render error message', () => {
    render(
      <ErrorMessage
        message="Something went wrong"
      />
    );

    expect(
      screen.getByText(
        'Something went wrong'
      )
    ).toBeInTheDocument();
  });

  it('should render nothing if no message exists', () => {
    const { container } = render(
      <ErrorMessage />
    );

    expect(
      container.firstChild
    ).toBeNull();
  });
});