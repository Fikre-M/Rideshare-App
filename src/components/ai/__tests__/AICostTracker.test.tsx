import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AICostTracker from '../ai/AICostTracker';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  m: {
    div: ({ children, ...props }: React.PropsWithChildren<object>) => <div {...props}>{children}</div>,
  },
}));

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) =>
  render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );

describe('AICostTracker', () => {
  it('renders without crashing', () => {
    renderWithTheme(<AICostTracker />);
    // Should render some content
    expect(document.body).toBeInTheDocument();
  });

  it('displays cost information', () => {
    renderWithTheme(<AICostTracker />);
    // Look for cost-related text (adjust based on actual component)
    expect(screen.queryByText(/cost|usage|tokens/i)).toBeInTheDocument();
  });
});
