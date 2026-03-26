import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SmartMatching from '../ai/SmartMatching';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  m: {
    div: ({ children, ...props }: React.PropsWithChildren<object>) => <div {...props}>{children}</div>,
  },
}));

// Mock AI service
jest.mock('../../services/aiService', () => ({
  __esModule: true,
  default: {
    matchDriverPassenger: jest.fn().mockResolvedValue({
      matchedDriver: {
        id: 'driver-1',
        name: 'John Doe',
        rating: 4.8,
        eta: 3,
        vehicle: 'Toyota Camry'
      },
      matchScore: 0.95,
      source: 'openai'
    })
  }
}));

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) =>
  render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );

describe('SmartMatching', () => {
  it('renders without crashing', () => {
    renderWithTheme(<SmartMatching />);
    expect(screen.getByText(/smart matching/i)).toBeInTheDocument();
  });

  it('displays matching interface', () => {
    renderWithTheme(<SmartMatching />);
    expect(screen.getByRole('button', { name: /find match/i })).toBeInTheDocument();
  });

  it('shows loading state during matching', async () => {
    renderWithTheme(<SmartMatching />);
    const matchButton = screen.getByRole('button', { name: /find match/i });
    
    // Click button to trigger matching
    matchButton.click();
    
    // Should show loading state
    expect(screen.getByText(/matching|loading/i)).toBeInTheDocument();
  });
});
