import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import SmartMatching from '../ai/SmartMatching';
import aiService from '../../services/aiService';

// Mock dependencies
jest.mock('../../services/aiService');
const mockAiService = aiService as jest.Mocked<typeof aiService>;

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h6: ({ children, ...props }: any) => <h6 {...props}>{children}</h6>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock recharts to avoid canvas issues
jest.mock('recharts', () => ({
  RadarChart: ({ children }: any) => <div data-testid="radar-chart">{children}</div>,
  PolarGrid: () => <div data-testid="polar-grid" />,
  PolarAngleAxis: () => <div data-testid="polar-angle-axis" />,
  PolarRadiusAxis: () => <div data-testid="polar-radius-axis" />,
  Radar: () => <div data-testid="radar" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
}));

const theme = createTheme();

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const mockDrivers = [
  {
    id: 'driver-1',
    name: 'John Doe',
    rating: 4.8,
    location: { lat: 40.7589, lng: -73.9441 },
    vehicleType: 'sedan',
    available: true,
    vehicle: {
      type: 'sedan',
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      color: 'Silver'
    }
  },
  {
    id: 'driver-2',
    name: 'Jane Smith',
    rating: 4.9,
    location: { lat: 40.7489, lng: -73.9541 },
    vehicleType: 'suv',
    available: true,
    vehicle: {
      type: 'suv',
      make: 'Honda',
      model: 'Pilot',
      year: 2021,
      color: 'Black'
    }
  }
];

const mockMatchResults = [
  {
    driverId: 'driver-1',
    driverName: 'John Doe',
    matchScore: 95,
    reasoning: 'Closest driver with excellent rating',
    scores: {
      proximity: 95,
      rating: 90,
      vehicleMatch: 100,
      eta: 85,
      availability: 95
    },
    estimatedArrival: 3,
    vehicle: {
      type: 'sedan',
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      color: 'Silver'
    }
  },
  {
    driverId: 'driver-2',
    driverName: 'Jane Smith',
    matchScore: 88,
    reasoning: 'Good rating, slightly farther',
    scores: {
      proximity: 80,
      rating: 95,
      vehicleMatch: 90,
      eta: 75,
      availability: 90
    },
    estimatedArrival: 5,
    vehicle: {
      type: 'suv',
      make: 'Honda',
      model: 'Pilot',
      year: 2021,
      color: 'Black'
    }
  }
];

describe('SmartMatching Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the passenger request form', () => {
    renderWithProviders(<SmartMatching />);

    expect(screen.getByText('Smart Driver Matching')).toBeInTheDocument();
    expect(screen.getByLabelText(/pickup location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/destination/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/number of passengers/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/vehicle type/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /find matches/i })).toBeInTheDocument();
  });

  it('shows loading state when matching is in progress', async () => {
    const user = userEvent.setup();
    
    // Mock a delayed response
    mockAiService.matchDriverPassenger.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ matches: mockMatchResults, source: 'openai' }), 100))
    );

    renderWithProviders(<SmartMatching />);

    // Fill out the form
    await user.type(screen.getByLabelText(/pickup location/i), '123 Main St');
    await user.type(screen.getByLabelText(/destination/i), '456 Oak Ave');
    await user.clear(screen.getByLabelText(/number of passengers/i));
    await user.type(screen.getByLabelText(/number of passengers/i), '2');

    // Click find matches
    await user.click(screen.getByRole('button', { name: /find matches/i }));

    // Should show loading state
    expect(screen.getByText(/finding best matches/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/finding best matches/i)).not.toBeInTheDocument();
    });
  });

  it('displays match results with best match highlighted', async () => {
    const user = userEvent.setup();
    
    mockAiService.matchDriverPassenger.mockResolvedValue({
      matches: mockMatchResults,
      source: 'openai'
    });

    renderWithProviders(<SmartMatching />);

    // Fill out and submit form
    await user.type(screen.getByLabelText(/pickup location/i), '123 Main St');
    await user.type(screen.getByLabelText(/destination/i), '456 Oak Ave');
    await user.click(screen.getByRole('button', { name: /find matches/i }));

    await waitFor(() => {
      expect(screen.getByText('Best Match')).toBeInTheDocument();
    });

    // Check best match details
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument(); // Match score
    expect(screen.getByText('3 min')).toBeInTheDocument(); // ETA
    expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    expect(screen.getByText('Closest driver with excellent rating')).toBeInTheDocument();

    // Check radar chart is rendered
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();

    // Check alternative drivers section
    expect(screen.getByText('Alternative Drivers')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('handles empty state when no drivers are available', async () => {
    const user = userEvent.setup();
    
    mockAiService.matchDriverPassenger.mockResolvedValue({
      matches: [],
      source: 'openai',
      message: 'No drivers available'
    });

    renderWithProviders(<SmartMatching />);

    await user.type(screen.getByLabelText(/pickup location/i), '123 Main St');
    await user.type(screen.getByLabelText(/destination/i), '456 Oak Ave');
    await user.click(screen.getByRole('button', { name: /find matches/i }));

    await waitFor(() => {
      expect(screen.getByText(/no drivers available/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/try adjusting your search/i)).toBeInTheDocument();
  });

  it('displays error state when matching fails', async () => {
    const user = userEvent.setup();
    
    mockAiService.matchDriverPassenger.mockRejectedValue(new Error('API Error'));

    renderWithProviders(<SmartMatching />);

    await user.type(screen.getByLabelText(/pickup location/i), '123 Main St');
    await user.type(screen.getByLabelText(/destination/i), '456 Oak Ave');
    await user.click(screen.getByRole('button', { name: /find matches/i }));

    await waitFor(() => {
      expect(screen.getByText(/error finding matches/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('calls onMatchSelect callback when a match is clicked', async () => {
    const user = userEvent.setup();
    const mockOnMatchSelect = jest.fn();
    
    mockAiService.matchDriverPassenger.mockResolvedValue({
      matches: mockMatchResults,
      source: 'openai'
    });

    renderWithProviders(<SmartMatching onMatchSelect={mockOnMatchSelect} />);

    // Fill out and submit form
    await user.type(screen.getByLabelText(/pickup location/i), '123 Main St');
    await user.type(screen.getByLabelText(/destination/i), '456 Oak Ave');
    await user.click(screen.getByRole('button', { name: /find matches/i }));

    await waitFor(() => {
      expect(screen.getByText('Best Match')).toBeInTheDocument();
    });

    // Click on the best match
    const selectButton = screen.getByRole('button', { name: /select john doe/i });
    await user.click(selectButton);

    expect(mockOnMatchSelect).toHaveBeenCalledWith(mockMatchResults[0]);
  });

  it('validates form inputs before submission', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(<SmartMatching />);

    // Try to submit without filling required fields
    await user.click(screen.getByRole('button', { name: /find matches/i }));

    // Should show validation errors
    expect(screen.getByText(/pickup location is required/i)).toBeInTheDocument();
    expect(screen.getByText(/destination is required/i)).toBeInTheDocument();
  });

  it('updates passenger count correctly', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(<SmartMatching />);

    const passengerInput = screen.getByLabelText(/number of passengers/i);
    
    await user.clear(passengerInput);
    await user.type(passengerInput, '4');

    expect(passengerInput).toHaveValue(4);
  });

  it('handles vehicle type selection', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(<SmartMatching />);

    // Click on vehicle type dropdown
    await user.click(screen.getByLabelText(/vehicle type/i));
    
    // Select SUV
    await user.click(screen.getByText('SUV'));

    expect(screen.getByDisplayValue('suv')).toBeInTheDocument();
  });

  it('shows matching factors in radar chart', async () => {
    const user = userEvent.setup();
    
    mockAiService.matchDriverPassenger.mockResolvedValue({
      matches: mockMatchResults,
      source: 'openai'
    });

    renderWithProviders(<SmartMatching />);

    await user.type(screen.getByLabelText(/pickup location/i), '123 Main St');
    await user.type(screen.getByLabelText(/destination/i), '456 Oak Ave');
    await user.click(screen.getByRole('button', { name: /find matches/i }));

    await waitFor(() => {
      expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    });

    // Check that matching factors are displayed
    expect(screen.getByText('Proximity')).toBeInTheDocument();
    expect(screen.getByText('Rating')).toBeInTheDocument();
    expect(screen.getByText('Vehicle Match')).toBeInTheDocument();
    expect(screen.getByText('ETA')).toBeInTheDocument();
    expect(screen.getByText('Availability')).toBeInTheDocument();
  });

  it('retries matching on error when retry button is clicked', async () => {
    const user = userEvent.setup();
    
    // First call fails, second succeeds
    mockAiService.matchDriverPassenger
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        matches: mockMatchResults,
        source: 'openai'
      });

    renderWithProviders(<SmartMatching />);

    await user.type(screen.getByLabelText(/pickup location/i), '123 Main St');
    await user.type(screen.getByLabelText(/destination/i), '456 Oak Ave');
    await user.click(screen.getByRole('button', { name: /find matches/i }));

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/error finding matches/i)).toBeInTheDocument();
    });

    // Click retry
    await user.click(screen.getByRole('button', { name: /try again/i }));

    // Should show results after retry
    await waitFor(() => {
      expect(screen.getByText('Best Match')).toBeInTheDocument();
    });

    expect(mockAiService.matchDriverPassenger).toHaveBeenCalledTimes(2);
  });

  it('displays AI source indicator', async () => {
    const user = userEvent.setup();
    
    mockAiService.matchDriverPassenger.mockResolvedValue({
      matches: mockMatchResults,
      source: 'openai'
    });

    renderWithProviders(<SmartMatching />);

    await user.type(screen.getByLabelText(/pickup location/i), '123 Main St');
    await user.type(screen.getByLabelText(/destination/i), '456 Oak Ave');
    await user.click(screen.getByRole('button', { name: /find matches/i }));

    await waitFor(() => {
      expect(screen.getByText(/powered by openai/i)).toBeInTheDocument();
    });
  });
});