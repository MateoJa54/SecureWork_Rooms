import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserSidebar from '../../../components/chat/UserSidebar.jsx';

describe('UserSidebar component', () => {
  const usuarios = [
    { nickname: 'Eduardo' },
    { nickname: 'Carlos' },
  ];

  it('should render connected users count', () => {
    render(
      <UserSidebar
        usuarios={usuarios}
        nicknameSelf="Eduardo"
      />
    );

    expect(screen.getByText(/Conectados \(2\)/i)).toBeInTheDocument();
  });

  it('should render all users', () => {
    render(
      <UserSidebar
        usuarios={usuarios}
        nicknameSelf="Eduardo"
      />
    );

    expect(screen.getByText(/Eduardo/i)).toBeInTheDocument();
    expect(screen.getByText(/Carlos/i)).toBeInTheDocument();
  });

  it('should identify current user', () => {
    render(
      <UserSidebar
        usuarios={usuarios}
        nicknameSelf="Eduardo"
      />
    );

    expect(screen.getByText(/Eduardo \(tú\)/i)).toBeInTheDocument();
  });

  it('should not mark other users as current user', () => {
    render(
      <UserSidebar
        usuarios={usuarios}
        nicknameSelf="Eduardo"
      />
    );

    expect(screen.queryByText(/Carlos \(tú\)/i)).not.toBeInTheDocument();
  });

  it('should render empty users list', () => {
    render(
      <UserSidebar
        usuarios={[]}
        nicknameSelf="Eduardo"
      />
    );

    expect(screen.getByText(/Conectados \(0\)/i)).toBeInTheDocument();
  });
});