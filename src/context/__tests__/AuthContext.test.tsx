import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../AuthContext';

// Stub crypto.subtle for jsdom
beforeAll(() => {
  Object.defineProperty(globalThis, 'crypto', {
    value: {
      subtle: {
        digest: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
      },
    },
    configurable: true,
  });
});

beforeEach(() => {
  localStorage.clear();
});

const TestConsumer = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return <div>loading</div>;
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'unauthenticated'}</span>
      <span data-testid="user-name">{user?.name ?? 'none'}</span>
    </div>
  );
};

const renderWithAuth = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    </MemoryRouter>
  );

describe('AuthContext', () => {
  it('renders without crashing', async () => {
    renderWithAuth();
    await waitFor(() => expect(screen.queryByText('loading')).not.toBeInTheDocument());
  });

  it('starts unauthenticated with no stored session', async () => {
    renderWithAuth();
    await waitFor(() =>
      expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated')
    );
  });

  it('throws when useAuth is used outside AuthProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<MemoryRouter><TestConsumer /></MemoryRouter>)).toThrow(
      'useAuth must be used within an AuthProvider'
    );
    spy.mockRestore();
  });

  it('restores session from localStorage on mount', async () => {
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const mockUser = { id: 'u1', email: 'test@test.com', name: 'Test User', roles: ['user'], exp };
    localStorage.setItem('ai_rideshare_auth_token', 'mock-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    renderWithAuth();
    await waitFor(() =>
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
    );
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
  });

  it('does not restore expired session', async () => {
    const exp = Math.floor(Date.now() / 1000) - 100; // expired
    const mockUser = { id: 'u1', email: 'test@test.com', name: 'Test User', roles: ['user'], exp };
    localStorage.setItem('ai_rideshare_auth_token', 'mock-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    renderWithAuth();
    await waitFor(() =>
      expect(screen.getByTestId('auth-status')).toHaveTextContent('unauthenticated')
    );
  });
});
