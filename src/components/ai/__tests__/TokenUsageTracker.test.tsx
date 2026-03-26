import React from 'react';
import { render, screen } from '@testing-library/react';
import TokenUsageTracker from '../TokenUsageTracker';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  m: {
    div: ({ children, ...props }: React.PropsWithChildren<object>) => <div {...props}>{children}</div>,
  },
}));

// Mock Zustand store
jest.mock('../../../stores/chatStore', () => ({
  useChatStore: () => ({
    getTokenUsage: () => ({
      totalTokens: 1000,
      totalCost: 0.05,
      requests: 10
    }),
    getDailyUsage: () => ({
      tokens: 100,
      cost: 0.005
    })
  })
}));

describe('TokenUsageTracker', () => {
  it('renders without crashing', () => {
    render(<TokenUsageTracker />);
    expect(document.body).toBeInTheDocument();
  });

  it('displays token usage information', () => {
    render(<TokenUsageTracker />);
    // Look for token-related content
    expect(screen.getByText(/tokens|usage|cost/i)).toBeInTheDocument();
  });

  it('shows cost metrics', () => {
    render(<TokenUsageTracker />);
    expect(screen.getByText(/0\.05|cost|price/i)).toBeInTheDocument();
  });
});
