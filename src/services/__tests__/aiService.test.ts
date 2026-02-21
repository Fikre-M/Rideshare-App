import aiService from '../aiService';
import openAIService from '../openAIService';
import googleAIService from '../googleAIService';
import MLAIService from '../../ai/services/MLAIService';
import { useApiKeyStore } from '../../stores/apiKeyStore';
import { server } from '../../__mocks__/msw';

// Mock dependencies
jest.mock('../openAIService');
jest.mock('../googleAIService');
jest.mock('../../ai/services/MLAIService');
jest.mock('../../stores/apiKeyStore');

const mockOpenAIService = openAIService as jest.Mocked<typeof openAIService>;
const mockGoogleAIService = googleAIService as jest.Mocked<typeof googleAIService>;
const mockMLAIService = MLAIService as jest.Mocked<typeof MLAIService>;
const mockUseApiKeyStore = useApiKeyStore as jest.MockedFunction<typeof useApiKeyStore>;

describe('AIService', () => {
  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    jest.clearAllMocks();
  });
  afterAll(() => server.close());

  beforeEach(() => {
    // Mock API key store
    mockUseApiKeyStore.mockReturnValue({
      getState: () => ({
        getKey: jest.fn((key: string) => {
          const keys: Record<string, string> = {
            openAI: 'test-openai-key',
            googleAI: 'test-google-key',
            mapbox: 'test-mapbox-token'
          };
          return keys[key] || '';
        })
      })
    } as any);
  });

  describe('Smart Matching', () => {
    const mockDrivers = [
      {
        id: 'driver-1',
        name: 'John Doe',
        rating: 4.8,
        location: { lat: 40.7589, lng: -73.9441 },
        vehicleType: 'sedan',
        available: true
      },
      {
        id: 'driver-2',
        name: 'Jane Smith',
        rating: 4.9,
        location: { lat: 40.7489, lng: -73.9541 },
        vehicleType: 'suv',
        available: true
      }
    ];

    const mockPassengerPreferences = {
      pickup: { lat: 40.7589, lng: -73.9441 },
      destination: { lat: 40.7789, lng: -73.9341 },
      vehicleType: 'sedan',
      passengers: 2
    };

    it('should successfully match drivers using OpenAI when available', async () => {
      const mockResult = [
        {
          driverId: 'driver-1',
          driverName: 'John Doe',
          matchScore: 95,
          reasoning: 'Closest driver with excellent rating',
          scores: { proximity: 95, rating: 90, vehicleMatch: 100, eta: 85, availability: 95 },
          estimatedArrival: 3
        }
      ];

      mockOpenAIService.matchDriverToPassenger.mockResolvedValue(mockResult);

      const result = await aiService.matchDriverPassenger(mockDrivers, mockPassengerPreferences);

      expect(mockOpenAIService.matchDriverToPassenger).toHaveBeenCalledWith(
        mockDrivers,
        mockPassengerPreferences
      );
      expect(result).toEqual({
        matches: mockResult,
        source: 'openai'
      });
    });

    it('should fallback to ML models when OpenAI fails', async () => {
      mockOpenAIService.matchDriverToPassenger.mockRejectedValue(new Error('OpenAI API error'));
      
      const mockMLResult = {
        matches: [{ driverId: 'driver-1', matchScore: 85, source: 'ml' }]
      };
      mockMLAIService.matchDrivers.mockResolvedValue(mockMLResult);

      const result = await aiService.matchDriverPassenger(mockDrivers, mockPassengerPreferences);

      expect(mockMLAIService.matchDrivers).toHaveBeenCalledWith(
        mockDrivers,
        mockPassengerPreferences
      );
      expect(result.source).toBe('ml');
    });

    it('should handle empty driver list', async () => {
      const result = await aiService.matchDriverPassenger([], mockPassengerPreferences);

      expect(result).toEqual({
        matches: [],
        source: 'fallback',
        message: 'No drivers available'
      });
    });

    it('should handle invalid coordinates', async () => {
      const invalidPreferences = {
        ...mockPassengerPreferences,
        pickup: { lat: 999, lng: 999 }
      };

      mockOpenAIService.matchDriverToPassenger.mockRejectedValue(
        new Error('Invalid coordinates')
      );

      const result = await aiService.matchDriverPassenger(mockDrivers, invalidPreferences);

      expect(result.source).toBe('fallback');
      expect(result.error).toBeDefined();
    });

    it('should retry on rate limit errors', async () => {
      mockOpenAIService.matchDriverToPassenger
        .mockRejectedValueOnce(new Error('Rate limit exceeded'))
        .mockResolvedValueOnce([{
          driverId: 'driver-1',
          matchScore: 90,
          reasoning: 'Retry successful'
        }]);

      const result = await aiService.matchDriverPassenger(mockDrivers, mockPassengerPreferences);

      expect(mockOpenAIService.matchDriverToPassenger).toHaveBeenCalledTimes(2);
      expect(result.source).toBe('openai');
    });

    it('should handle malformed JSON from OpenAI', async () => {
      mockOpenAIService.matchDriverToPassenger.mockRejectedValue(
        new Error('Invalid JSON response')
      );

      const result = await aiService.matchDriverPassenger(mockDrivers, mockPassengerPreferences);

      expect(result.source).toBe('ml');
    });
  });

  describe('Dynamic Pricing', () => {
    const mockPricingContext = {
      distance: 5.2,
      estimatedTime: 15,
      pickup: { lat: 40.7589, lng: -73.9441 },
      destination: { lat: 40.7789, lng: -73.9341 },
      time: new Date(),
      passengers: 2
    };

    it('should calculate dynamic pricing using OpenAI', async () => {
      const mockResult = {
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
          weather: { condition: 'rain', impact: 0.1 }
        }
      };

      mockOpenAIService.calculateDynamicPricing.mockResolvedValue(mockResult);

      const result = await aiService.calculateDynamicPrice(mockPricingContext);

      expect(mockOpenAIService.calculateDynamicPricing).toHaveBeenCalledWith(mockPricingContext);
      expect(result).toEqual({
        ...mockResult,
        source: 'openai'
      });
    });

    it('should fallback to ML pricing model', async () => {
      mockOpenAIService.calculateDynamicPricing.mockRejectedValue(new Error('API error'));
      
      const mockMLResult = {
        surgeMultiplier: 1.2,
        finalPrice: 15.00,
        source: 'ml'
      };
      mockMLAIService.calculateDynamicPrice.mockResolvedValue(mockMLResult);

      const result = await aiService.calculateDynamicPrice(mockPricingContext);

      expect(result.source).toBe('ml');
      expect(result.surgeMultiplier).toBe(1.2);
    });

    it('should handle API rate limit errors with exponential backoff', async () => {
      mockOpenAIService.calculateDynamicPricing
        .mockRejectedValueOnce(new Error('Rate limit exceeded'))
        .mockRejectedValueOnce(new Error('Rate limit exceeded'))
        .mockResolvedValueOnce({
          surgeMultiplier: 1.3,
          finalPrice: 16.25
        });

      const startTime = Date.now();
      const result = await aiService.calculateDynamicPrice(mockPricingContext);
      const endTime = Date.now();

      expect(mockOpenAIService.calculateDynamicPricing).toHaveBeenCalledTimes(3);
      expect(result.source).toBe('openai');
      // Should have some delay due to retries
      expect(endTime - startTime).toBeGreaterThan(100);
    });
  });

  describe('Route Optimization', () => {
    const mockWaypoints = [
      { lat: 40.7589, lng: -73.9441 },
      { lat: 40.7789, lng: -73.9341 }
    ];

    const mockPreferences = {
      prioritizeTime: true,
      avoidTolls: false,
      ecoFriendly: false
    };

    it('should optimize route using OpenAI and Mapbox', async () => {
      const mockResult = {
        optimizedRoute: {
          distance: 5000,
          duration: 900,
          geometry: { coordinates: [[0, 0], [1, 1]] }
        },
        recommendation: {
          reasoning: 'Fastest route with minimal traffic',
          score: 95
        },
        estimatedTime: 15,
        estimatedDistance: 5.0,
        source: 'openai-mapbox'
      };

      mockOpenAIService.optimizeRoute.mockResolvedValue({
        recommendedRouteIndex: 0,
        reasoning: 'Fastest route'
      });

      const result = await aiService.optimizeRoute(mockWaypoints, mockPreferences);

      expect(result.source).toBe('openai-mapbox');
    });

    it('should handle route optimization errors gracefully', async () => {
      mockOpenAIService.optimizeRoute.mockRejectedValue(new Error('No routes found'));

      const result = await aiService.optimizeRoute(mockWaypoints, mockPreferences);

      expect(result.source).toBe('ml');
    });
  });

  describe('Demand Prediction', () => {
    const mockLocation = { lat: 40.7589, lng: -73.9441 };

    it('should predict demand using OpenAI', async () => {
      const mockResult = {
        predictions: [
          { hour: 14, demand: 0.7, confidence: 0.85 },
          { hour: 15, demand: 0.8, confidence: 0.82 }
        ],
        peakHours: [17, 18],
        insights: 'Rush hour peak expected'
      };

      mockOpenAIService.predictDemand.mockResolvedValue(mockResult);

      const result = await aiService.predictDemand(mockLocation);

      expect(mockOpenAIService.predictDemand).toHaveBeenCalledWith(mockLocation, '6h');
      expect(result).toEqual({
        ...mockResult,
        source: 'openai'
      });
    });

    it('should fallback to ML demand prediction', async () => {
      mockOpenAIService.predictDemand.mockRejectedValue(new Error('API error'));
      
      const mockMLResult = {
        currentDemand: 0.75,
        predictedDemand: [{ hour: 14, demand: 0.7 }],
        source: 'ml'
      };
      mockMLAIService.predictDemand.mockResolvedValue(mockMLResult);

      const result = await aiService.predictDemand(mockLocation);

      expect(result.source).toBe('ml');
    });
  });

  describe('Predictive Analytics', () => {
    it('should get analytics using OpenAI', async () => {
      const mockResult = {
        revenue: {
          today: { projected: 15000, actual: 12000, variance: -20 },
          week: { projected: 105000, actual: 98000, variance: -6.7 }
        },
        utilization: {
          current: 0.75,
          peak: 0.92,
          trend: 'increasing'
        },
        insights: ['Revenue below target', 'Utilization improving']
      };

      mockOpenAIService.getPredictiveAnalytics.mockResolvedValue(mockResult);

      const result = await aiService.getPredictiveAnalytics();

      expect(result).toEqual({
        ...mockResult,
        source: 'openai'
      });
    });

    it('should handle analytics errors', async () => {
      mockOpenAIService.getPredictiveAnalytics.mockRejectedValue(new Error('API error'));

      const result = await aiService.getPredictiveAnalytics();

      expect(result.source).toBe('fallback');
      expect(result.error).toBeDefined();
    });
  });

  describe('Chat Interface', () => {
    it('should send chat message using Google AI', async () => {
      const mockResponse = {
        text: 'Hello! How can I help you?',
        suggestions: ['Book a ride', 'Check pricing']
      };

      mockGoogleAIService.sendChatMessage.mockResolvedValue(mockResponse);

      const result = await aiService.sendChatMessage('Hello', { conversationId: 'test-123' });

      expect(mockGoogleAIService.sendChatMessage).toHaveBeenCalledWith('Hello', 'test-123');
      expect(result).toEqual(mockResponse);
    });

    it('should fallback to mock response on chat error', async () => {
      mockGoogleAIService.sendChatMessage.mockRejectedValue(new Error('API error'));
      mockGoogleAIService.getMockResponse.mockReturnValue({
        text: 'Sorry, I encountered an error. Please try again.',
        isError: true
      });

      const result = await aiService.sendChatMessage('Hello');

      expect(mockGoogleAIService.getMockResponse).toHaveBeenCalledWith('Hello');
      expect(result.isError).toBe(true);
    });
  });

  describe('Service Availability Checks', () => {
    it('should correctly identify OpenAI availability', () => {
      expect(aiService.isOpenAIAvailable()).toBe(true);
    });

    it('should correctly identify Mapbox availability', () => {
      expect(aiService.isMapboxAvailable()).toBe(true);
    });

    it('should handle missing API keys', () => {
      mockUseApiKeyStore.mockReturnValue({
        getState: () => ({
          getKey: jest.fn(() => '')
        })
      } as any);

      expect(aiService.isOpenAIAvailable()).toBe(false);
      expect(aiService.isMapboxAvailable()).toBe(false);
    });
  });
});