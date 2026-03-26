// AI Service Layer - Handles all AI/ML API interactions
import axios, { AxiosInstance } from 'axios';
import MLAIService from '../ai/services/MLAIService';
import googleAIService from './googleAIService';
import openAIService from './openAIService';
import mapboxService from './mapboxService';
import { useApiKeyStore } from '../stores/apiKeyStore';

const AI_API_BASE = import.meta.env.VITE_AI_API_URL || 'http://localhost:8001/api/ai';
const USE_ML_MODELS = import.meta.env.VITE_USE_ML_MODELS !== 'false';
const USE_OPENAI = import.meta.env.VITE_USE_OPENAI !== 'false';

interface Coordinate {
  lat: number;
  lng: number;
}

interface PassengerRequest {
  availableDrivers?: MockDriver[];
  vehicleType?: string;
  maxWaitTime?: number;
  preferredRating?: number;
  location?: Coordinate;
  pickup?: Coordinate;
  destination?: Coordinate;
  [key: string]: unknown;
}

interface TripDetails {
  demandLevel?: string;
  weather?: string;
  events?: string;
  traffic?: string;
  availableDrivers?: number;
  pendingRequests?: number;
  distance?: number;
  [key: string]: unknown;
}

interface MockDriver {
  driverId: string;
  driverName: string;
  rating: number;
  distance: number;
  vehicleType: string;
  vehicle: string;
  location: Coordinate;
  availability: string;
}

interface ChatContext {
  conversationId?: string;
  [key: string]: unknown;
}

class AIService {
  private apiClient: AxiosInstance;
  private mlService: typeof MLAIService;
  private mlInitialized = false;

  constructor() {
    this.apiClient = axios.create({
      baseURL: AI_API_BASE,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.apiClient.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    this.mlService = MLAIService;
  }

  private isOpenAIAvailable(): boolean {
    try {
      const apiKey = useApiKeyStore.getState().getKey('openAI');
      return USE_OPENAI && !!apiKey && apiKey !== 'your_openai_api_key_here';
    } catch {
      return false;
    }
  }

  private isMapboxAvailable(): boolean {
    try {
      const token = useApiKeyStore.getState().getKey('mapbox');
      return !!token && token !== 'your_mapbox_token_here';
    } catch {
      return false;
    }
  }

  // Public methods for checking service availability
  public isServiceAvailable(service: 'openai' | 'mapbox' | 'googleai'): boolean {
    switch (service) {
      case 'openai':
        return this.isOpenAIAvailable();
      case 'mapbox':
        return this.isMapboxAvailable();
      case 'googleai':
        try {
          const apiKey = useApiKeyStore.getState().getKey('googleAI');
          return !!apiKey && apiKey !== 'your_google_ai_api_key_here';
        } catch {
          return false;
        }
      default:
        return false;
    }
  }

  private async ensureMLInitialized(): Promise<void> {
    if (!this.mlInitialized) {
      await this.mlService.initialize();
      this.mlInitialized = true;
    }
  }

  async sendChatMessage(message: string, context: ChatContext = {}): Promise<unknown> {
    try {
      return await googleAIService.sendChatMessage(message, context.conversationId);
    } catch (error) {
      console.error('Chat AI error:', error);
      return googleAIService.getMockResponse(message);
    }
  }

  async optimizeRoute(waypoints: Coordinate[], preferences: Record<string, unknown> = {}): Promise<unknown> {
    try {
      if (this.isOpenAIAvailable() && this.isMapboxAvailable() && waypoints.length >= 2) {
        const origin = waypoints[0];
        const destination = waypoints[waypoints.length - 1];
        const mapboxResult = await mapboxService.getRouteWithTraffic(origin, destination, { alternatives: true });

        if (mapboxResult.routes.length > 0) {
          const aiResult = await openAIService.optimizeRoute(mapboxResult.routes, preferences);
          const recommended = mapboxResult.routes[aiResult.recommendedRouteIndex];
          return {
            optimizedRoute: recommended,
            allRoutes: mapboxResult.routes,
            recommendation: aiResult,
            estimatedTime: Math.round(recommended.durationMinutes),
            estimatedDistance: recommended.distanceKm,
            source: 'openai-mapbox',
          };
        }
      }

      if (USE_ML_MODELS) {
        await this.ensureMLInitialized();
        return await (this.mlService as any).optimizeRoute(waypoints, preferences);
      }

      const response = await this.apiClient.post('/route-optimization', {
        waypoints,
        preferences: { prioritizeTime: true, avoidTolls: false, avoidHighways: false, ...preferences },
      });
      return (response as any).data;
    } catch (error) {
      console.error('Route optimization error:', error);
      return this.mockRouteOptimization(waypoints);
    }
  }

  async predictDemand(location: string, timeRange: string): Promise<unknown> {
    try {
      if (this.isOpenAIAvailable()) {
        const result = await openAIService.predictDemand({
          location, timeRange, currentDemand: 'medium', weather: 'clear', temperature: 'moderate',
        });
        return { ...result, source: 'openai' };
      }

      if (USE_ML_MODELS) {
        await this.ensureMLInitialized();
        return await (this.mlService as any).predictDemand(location, timeRange);
      }

      const response = await this.apiClient.post('/demand-prediction', { location, timeRange, historicalData: true });
      return (response as any).data;
    } catch (error) {
      console.error('Demand prediction error:', error);
      return this.mockDemandPrediction(location);
    }
  }

  async calculateDynamicPrice(tripDetails: TripDetails): Promise<unknown> {
    try {
      if (this.isOpenAIAvailable()) {
        const result = await openAIService.calculateDynamicPricing({
          basePrice: 8.50,
          demandLevel: tripDetails.demandLevel ?? 'medium',
          weather: tripDetails.weather ?? 'clear',
          timeOfDay: new Date().toLocaleTimeString(),
          dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
          events: tripDetails.events ?? 'none',
          traffic: tripDetails.traffic ?? 'moderate',
          availableDrivers: tripDetails.availableDrivers,
          pendingRequests: tripDetails.pendingRequests,
        });
        return { ...result, source: 'openai' };
      }

      if (USE_ML_MODELS) {
        await this.ensureMLInitialized();
        return await (this.mlService as any).calculateDynamicPrice(tripDetails);
      }

      const response = await this.apiClient.post('/dynamic-pricing', {
        ...tripDetails,
        timestamp: new Date().toISOString(),
      });
      return (response as any).data;
    } catch (error) {
      console.error('Dynamic pricing error:', error);
      return this.mockDynamicPricing(tripDetails);
    }
  }

  async matchDriverPassenger(passengerRequest: PassengerRequest): Promise<unknown> {
    try {
      if (this.isOpenAIAvailable()) {
        const drivers = passengerRequest.availableDrivers ?? this.getMockDrivers();
        const preferences = {
          vehicleType: passengerRequest.vehicleType,
          maxWaitTime: passengerRequest.maxWaitTime ?? 10,
          preferredRating: passengerRequest.preferredRating ?? 4.5,
          location: passengerRequest.location,
        };

        const result = await openAIService.matchDriverToPassenger(drivers, preferences);
        const topMatch = (result.matches[0] ?? {}) as Record<string, any>;

        return {
          matchedDriver: {
            id: topMatch.driverId,
            name: topMatch.driverName,
            rating: topMatch.scores?.rating ?? 4.5,
            eta: topMatch.estimatedArrival,
            vehicle: topMatch.vehicle,
            location: topMatch.location ?? { lat: 9.0054, lng: 38.7636 },
          },
          matchScore: (topMatch.matchScore ?? 80) / 100,
          alternativeDrivers: result.matches.length - 1,
          matchingFactors: {
            proximity: (topMatch.scores?.proximity ?? 80) / 100,
            rating: (topMatch.scores?.rating ?? 85) / 100,
            vehicleType: (topMatch.scores?.vehicleMatch ?? 80) / 100,
            availability: (topMatch.scores?.availability ?? 95) / 100,
          },
          allMatches: result.matches,
          source: 'openai',
        };
      }

      if (USE_ML_MODELS) {
        await this.ensureMLInitialized();
        return await (this.mlService as any).matchDriverPassenger(passengerRequest);
      }

      const response = await this.apiClient.post('/smart-matching', {
        ...passengerRequest,
        algorithm: 'ml-optimized',
      });
      return (response as any).data;
    } catch (error) {
      console.error('Smart matching error:', error);
      return this.mockSmartMatching(passengerRequest);
    }
  }

  async getPredictiveAnalytics(timeframe = '24h'): Promise<unknown> {
    try {
      if (this.isOpenAIAvailable()) {
        const result = await openAIService.getPredictiveAnalytics({
          currentMetrics: {
            activeRides: Math.floor(Math.random() * 100) + 50,
            availableDrivers: Math.floor(Math.random() * 50) + 30,
            averageWaitTime: Math.floor(Math.random() * 10) + 3,
            currentRevenue: Math.floor(Math.random() * 5000) + 10000,
          },
          historicalData: {
            last30DaysRevenue: Array.from({ length: 30 }, (_, i) => ({
              day: i + 1,
              revenue: Math.floor(Math.random() * 20000) + 10000,
              rides: Math.floor(Math.random() * 500) + 200,
            })),
            averageRidesPerDay: 350,
            peakHours: [8, 9, 17, 18, 19],
          },
        });
        return { ...result, source: 'openai' };
      }

      if (USE_ML_MODELS) {
        await this.ensureMLInitialized();
        return await (this.mlService as any).getPredictiveAnalytics(timeframe);
      }

      const response = await this.apiClient.get(`/predictive-analytics?timeframe=${timeframe}`);
      return (response as any).data;
    } catch (error) {
      console.error('Predictive analytics error:', error);
      return this.mockPredictiveAnalytics();
    }
  }

  getMockDrivers(): MockDriver[] {
    return [
      { driverId: 'driver_001', driverName: 'John Smith', rating: 4.8, distance: 2.5, vehicleType: 'sedan', vehicle: 'Toyota Camry - ABC 123', location: { lat: 9.0054, lng: 38.7636 }, availability: 'available' },
      { driverId: 'driver_002', driverName: 'Sarah Johnson', rating: 4.9, distance: 3.2, vehicleType: 'suv', vehicle: 'Honda CR-V - XYZ 789', location: { lat: 9.0104, lng: 38.7686 }, availability: 'available' },
      { driverId: 'driver_003', driverName: 'Michael Chen', rating: 4.7, distance: 1.8, vehicleType: 'sedan', vehicle: 'Nissan Altima - DEF 456', location: { lat: 9.0024, lng: 38.7606 }, availability: 'available' },
    ];
  }

  private mockRouteOptimization(waypoints: Coordinate[]) {
    return {
      optimizedRoute: waypoints,
      estimatedTime: Math.floor(Math.random() * 30) + 10,
      estimatedDistance: Math.floor(Math.random() * 20) + 5,
      fuelEfficiency: 'High',
      trafficConditions: 'Moderate',
      alternativeRoutes: 2,
    };
  }

  private mockDemandPrediction(location: string) {
    return {
      currentDemand: Math.floor(Math.random() * 100) + 20,
      predictedDemand: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        demand: Math.floor(Math.random() * 100) + 10,
        confidence: Math.random() * 0.3 + 0.7,
      })),
      peakHours: [8, 9, 17, 18, 19],
      recommendations: [
        'Increase driver incentives during peak hours',
        'Deploy more vehicles in high-demand areas',
      ],
    };
  }

  private mockDynamicPricing(tripDetails: TripDetails) {
    const basePrice = 8.50;
    const surgeMultiplier = Math.random() * 2 + 1;
    return {
      basePrice,
      surgeMultiplier,
      finalPrice: basePrice * surgeMultiplier,
      factors: { demand: 'High', weather: 'Clear', events: 'Concert nearby', traffic: 'Heavy' },
      priceBreakdown: {
        baseFare: basePrice,
        distanceRate: 2.50,
        timeRate: 1.20,
        surge: basePrice * surgeMultiplier - basePrice,
      },
    };
  }

  private mockSmartMatching(_passengerRequest: PassengerRequest) {
    return {
      matchedDriver: {
        id: 'driver_123',
        name: 'John Smith',
        rating: 4.8,
        eta: Math.floor(Math.random() * 8) + 2,
        vehicle: 'Toyota Camry - ABC 123',
        location: { lat: 9.0054, lng: 38.7636 },
      },
      matchScore: Math.random() * 0.3 + 0.7,
      alternativeDrivers: 3,
      matchingFactors: { proximity: 0.9, rating: 0.85, vehicleType: 0.8, availability: 0.95 },
    };
  }

  private mockPredictiveAnalytics() {
    return {
      rideDemandForecast: {
        next24Hours: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          predictedRides: Math.floor(Math.random() * 50) + 20,
          confidence: Math.random() * 0.2 + 0.8,
        })),
      },
      revenueProjection: {
        today: Math.floor(Math.random() * 5000) + 15000,
        thisWeek: Math.floor(Math.random() * 20000) + 80000,
        thisMonth: Math.floor(Math.random() * 50000) + 300000,
      },
      driverUtilization: {
        current: Math.random() * 0.3 + 0.6,
        predicted: Math.random() * 0.3 + 0.7,
        optimal: 0.85,
      },
      insights: [
        'Peak demand expected at 6 PM in downtown area',
        'Weather forecast suggests 15% increase in ride requests',
        'Concert event will drive demand up by 25% near stadium',
        'Recommend deploying 5 additional drivers in Bole area',
      ],
    };
  }
}

export default new AIService();
