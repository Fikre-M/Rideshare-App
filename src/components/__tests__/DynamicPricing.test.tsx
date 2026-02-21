import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import DynamicPricing from '../ai/DynamicPricing';
import aiService from '../../services/aiService';

// Mock dependencies
jest.mock('../../services/aiService');
const mockAiService = aiService as jest.Mocked<typeof aiService>;

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock recharts
jest.mock('recharts', () => ({
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  Tooltip: () => <div data-testid="tooltip" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
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

const mockPricingResult = {
  surgeMultiplier: 1.5,
  finalPrice: 18.75,
  basePrice: 12.50,
  priceBreakdown: {
    baseFare: 3.50,
    distanceRate: 6.00,
    timeRate: 3.00,
    surgeAmount: 6.25
  },
  factors: {
    demand: { level: 'high', impact: 0.3 },
    weather: { condition: 'rain', impact: 0.1 },
    events: { hasEvents: true, impact: 0.1 },
    traffic: { level: 'moderate', impact: 0.0 }
  },
  reasoning: 'High demand due to rain and nearby events',
  source: 'openai'
};

describe('DynamicPricing Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the trip details form', () => {
    renderWithProviders(<DynamicPricing />);

    expect(screen.getByText('Dynamic Pricing Calculator')).toBeInTheDocument();
    expect(screen.getByLabelText(/pickup location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/destination/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/distance/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/estimated time/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /calculate price/i })).toBeInTheDocument();
  });

  it('displays surge multiplier correctly', async () => {
    const user = userEvent.setup();
    
    mockAiService.calculateDynamicPrice.mockResolvedValue(mockPricingResult);

    renderWithProviders(<DynamicPricing />);

    // Fill out the form
    await user.type(screen.getByLabelText(/pickup location/i), '123 Main St');
    await user.type(screen.getByLabelText(/destination/i), '456 Oak Ave');
    await user.clear(screen.getByLabelText(/distance/i));
    await user.type(screen.getByLabelText(/distance/i), '5.2');
    await user.clear(screen.getByLabelText(/estimated time/i));
    await user.type(screen.getByLabelText(/estimated time/i), '15');

    // Calculate price
    await user.click(screen.getByRole('button', { name: /calculate price/i }));

    await waitFor(() => {
      expect(screen.getByText('1.5x')).toBeInTheDocument(); // Surge multiplier
    });

    expect(screen.getByText('$18.75')).toBeInTheDocument(); // Final price
    expect(screen.getByText('High Surge')).toBeInTheDocument(); // Surge level indicator
  });

  it('shows price breakdown in pie chart', async () => {
    const user = userEvent.setup();
    
    mockAiService.calculateDynamicPrice.mockResolvedValue(mockPricingResult);

    renderWithProviders(<DynamicPricing />);

    await user.type(screen.getByLabelText(/pickup location/i), '123 Main St');
    await user.type(screen.getByLabelText(/destination/i), '456 Oak Ave');
    await user.click(screen.getByRole('button', { name: /calculate price/i }));

    await waitFor(() => {
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    // Check price breakdown components
    expect(screen.getByText('Base Fare')).toBeInTheDocument();
    expect(screen.getByText('$3.50')).toBeInTheDocument();
    expect(screen.getByText('Distance')).toBeInTheDocument();
    expect(screen.getByText('$6.00')).toBeInTheDocument();
    expect(screen.getByText('Time')).toBeInTheDocument();
    expect(screen.getByText('$3.00')).toBeInTheDocument();
    expect(screen.getByText('Surge')).toBeInTheDocument();
    expect(screen.getByText('$6.25')).toBeInTheDocument();
  });

  it('displays pricing factors with impact levels', async () => {
    const user = userEvent.setup();
    
    mockAiService.calculateDynamicPrice.mockResolvedValue(mockPricingResult);

    renderWithProviders(<DynamicPricing />);

    await user.type(screen.getByLabelText(/pickup location/i), '123 Main St');
    await user.type(screen.getByLabelText(/destination/i), '456 Oak Ave');
    await user.click(screen.getByRole('button', { name: /calculate price/i }));

    await waitFor(() => {
      expect(screen.getByText('Pricing Factors')).toBeInTheDocument();
    });

    // Check individual factors
    expect(screen.getByText('Demand')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Weather')).toBeInTheDocument();
    expect(screen.getByText('Rain')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('Traffic')).toBeInTheDocument();
    expect(screen.getByText('Moderate')).toBeInTheDocument();
  });

  it('shows loading state during price calculation', async () => {
    const user = userEvent.setup();
    
    // Mock a delayed response
    mockAiService.calculateDynamicPrice.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockPricingResult), 100))
    );

    renderWithProviders(<DynamicPricing />);

    await user.type(screen.getByLabelText(/pickup location/i), '123 Main St');
    await user.type(screen.getByLabelText(/destination/i), '456 Oak Ave');
    await user.click(screen.getByRole('button', { name: /calculate price/i }));

    // Should show loading state
    expect(screen.getByText(/calculating price/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/calculating price/i)).not.toBeInTheDocument();
    });
  });

  it('displays error state when pricing calculation fails', async () => {
    const user = userEvent.setup();
    
    mockAiService.calculateDynamicPrice.mockRejectedValue(new Error('Pricing API Error'));

    renderWithProviders(<DynamicPricing />);

    await user.type(screen.getByLabelText(/pickup location/i), '123 Main St');
    await user.type(screen.getByLabelText(/destination/i), '456 Oak Ave');
    await user.click(screen.getByRole('button', { name: /calculate price/i }));

    await waitFor(() => {
      expect(screen.getByText(/error calculating price/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('shows breakdown tooltip when hovering over pie chart', async () => {
    const user = userEvent.setup();
    
    mockAiService.calculateDynamicPrice.mockResolvedValue(mockPricingResult);

    renderWithProviders(<DynamicPricing />);

    await user.type(screen.getByLabelText(/pickup location/i), '123 Main St');
    await user.type(screen.getByLabelText(/destination/i), '456 Oak Ave');
    await user.click(screen.getByRole('button', { name: /calculate price/i }));

    await waitFor(() => {
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    });
  });

  it('validates form inputs before calculation', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(<DynamicPricing />);

    // Try to calculate without filling required fields
    await user.click(screen.getByRole('button', { name: /calculate price/i }));

    // Should show validation errors
    expect(screen.getByText(/pickup location is required/i)).toBeInTheDocument();
    expect(screen.getByText(/destination is required/i)).toBeInTheDocument();
  });

  it('handles different surge levels with appropriate styling', async () => {
    const user = userEvent.setup();
    
    // Test high surge (>1.5)
    const highSurgeResult = { ...mockPricingResult, surgeMultiplier: 2.0 };
    mockAiService.calculateDynamicPrice.mockResolvedValue(highSurgeResult);

    renderWithProviders(<DynamicPricing />);

    await user.type(screen.getByLabelText(/pickup location/i), '123 Main St');
    await user.type(screen.getByLabelText(/destination/i), '456 Oak Ave');
    await user.click(screen.getByRole('button', { name: /calculate price/i }));

    await waitFor(() => {
      expect(screen.getByText('2.0x')).toBeInTheDocument();
    });

    // Should show high surge styling (red border/background)
    const priceCard = screen.getByText('2.0x').closest('.MuiCard-root');
    expect(priceCard).toHaveStyle({ border: expect.stringContaining('error') });
  });

  it('handles medium surge levels (1.2-1.5)', async () => {
    const user = userEvent.setup();
    
    const mediumSurgeResult = { ...mockPricingResult, surgeMultiplier: 1.3 };
    mockAiService.calculateDynamicPrice.mockResolvedValue(mediumSurgeResult);

    renderWithProviders(<DynamicPricing />);

    await user.type(screen.getByLabelText(/pickup location/i), '123 Main St');
    await user.type(screen.getByLabelText(/destination/i), '456 Oak Ave');
    await user.click(screen.getByRole('button', { name: /calculate price/i }));

    await waitFor(() => {
      expect(screen.getByText('1.3x')).toBeInTheDocument();
    });

    expect(screen.getByText('Medium Surge')).toBeInTheDocument();
  });

  it('handles no surge (1.0)', async () => {
    const user = userEvent.setup();
    
    const noSurgeResult = { ...mockPricingResult, surgeMultiplier: 1.0, finalPrice: 12.50 };
    mockAiService.calculateDynamicPrice.mockResolvedValue(noSurgeResult);

    renderWithProviders(<DynamicPricing />);

    await user.type(screen.getByLabelText(/pickup location/i), '123 Main St');
    await user.type(screen.getByLabelText(/destination/i), '456 Oak Ave');
    await user.click(screen.getByRole('button', { name: /calculate price/i }));

    await waitFor(() => {
      expect(screen.getByText('1.0x')).toBeInTheDocument();
    });

    expect(screen.getByText('No Surge')).toBeInTheDocument();
  });

  it('displays AI reasoning for pricing decision', async () => {
    const user = userEvent.setup();
    
    mockAiService.calculateDynamicPrice.mockResolvedValue(mockPricingResult);

    renderWithProviders(<DynamicPricing />);

    await user.type(screen.getByLabelText(/pickup location/i), '123 Main St');
    await user.type(screen.getByLabelText(/destination/i), '456 Oak Ave');
    await user.click(screen.getByRole('button', { name: /calculate price/i }));

    await waitFor(() => {
      expect(screen.getByText('High demand due to rain and nearby events')).toBeInTheDocument();
    });
  });

  it('calls onPriceCalculated callback when provided', async () => {
    const user = userEvent.setup();
    const mockOnPriceCalculated = jest.fn();
    
    mockAiService.calculateDynamicPrice.mockResolvedValue(mockPricingResult);

    renderWithProviders(<DynamicPricing onPriceCalculated={mockOnPriceCalculated} />);

    await user.type(screen.getByLabelText(/pickup location/i), '123 Main St');
    await user.type(screen.getByLabelText(/destination/i), '456 Oak Ave');
    await user.click(screen.getByRole('button', { name: /calculate price/i }));

    await waitFor(() => {
      expect(mockOnPriceCalculated).toHaveBeenCalledWith(mockPricingResult);
    });
  });

  it('retries calculation on error when retry button is clicked', async () => {
    const user = userEvent.setup();
    
    // First call fails, second succeeds
    mockAiService.calculateDynamicPrice
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(mockPricingResult);

    renderWithProviders(<DynamicPricing />);

    await user.type(screen.getByLabelText(/pickup location/i), '123 Main St');
    await user.type(screen.getByLabelText(/destination/i), '456 Oak Ave');
    await user.click(screen.getByRole('button', { name: /calculate price/i }));

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/error calculating price/i)).toBeInTheDocument();
    });

    // Click retry
    await user.click(screen.getByRole('button', { name: /try again/i }));

    // Should show results after retry
    await waitFor(() => {
      expect(screen.getByText('$18.75')).toBeInTheDocument();
    });

    expect(mockAiService.calculateDynamicPrice).toHaveBeenCalledTimes(2);
  });

  it('displays AI source indicator', async () => {
    const user = userEvent.setup();
    
    mockAiService.calculateDynamicPrice.mockResolvedValue(mockPricingResult);

    renderWithProviders(<DynamicPricing />);

    await user.type(screen.getByLabelText(/pickup location/i), '123 Main St');
    await user.type(screen.getByLabelText(/destination/i), '456 Oak Ave');
    await user.click(screen.getByRole('button', { name: /calculate price/i }));

    await waitFor(() => {
      expect(screen.getByText(/powered by openai/i)).toBeInTheDocument();
    });
  });

  it('handles numeric input validation for distance and time', async () => {
    const user = userEvent.setup();
    
    renderWithProviders(<DynamicPricing />);

    const distanceInput = screen.getByLabelText(/distance/i);
    const timeInput = screen.getByLabelText(/estimated time/i);

    // Test invalid inputs
    await user.clear(distanceInput);
    await user.type(distanceInput, '-5');
    await user.clear(timeInput);
    await user.type(timeInput, 'abc');

    await user.click(screen.getByRole('button', { name: /calculate price/i }));

    expect(screen.getByText(/distance must be positive/i)).toBeInTheDocument();
    expect(screen.getByText(/time must be a valid number/i)).toBeInTheDocument();
  });
});