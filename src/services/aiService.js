// AI Service Layer - Handles all AI/ML API interactions
import axios from 'axios';

const AI_API_BASE = import.meta.env.VITE_AI_API_URL || 'http://localhost:8001/api/ai';

class AIService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: AI_API_BASE,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.apiClient.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // AI Chat Interface
  async sendChatMessage(message, context = {}) {
    try {
      const response = await this.apiClient.post('/chat', {
        message,
        context,
        timestamp: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      console.error('Chat AI error:', error);
      // Fallback to mock response
      return this.mockChatResponse(message);
    }
  }

  // Route Optimization
  async optimizeRoute(waypoints, preferences = {}) {
    try {
      const response = await this.apiClient.post('/route-optimization', {
        waypoints,
        preferences: {
          prioritizeTime: true,
          avoidTolls: false,
          avoidHighways: false,
          ...preferences,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Route optimization error:', error);
      return this.mockRouteOptimization(waypoints);
    }
  }

  // Demand Prediction
  async predictDemand(location, timeRange) {
    try {
      const response = await this.apiClient.post('/demand-prediction', {
        location,
        timeRange,
        historicalData: true,
      });
      return response.data;
    } catch (error) {
      console.error('Demand prediction error:', error);
      return this.mockDemandPrediction(location);
    }
  }

  // Dynamic Pricing
  async calculateDynamicPrice(tripDetails) {
    try {
      const response = await this.apiClient.post('/dynamic-pricing', {
        ...tripDetails,
        timestamp: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      console.error('Dynamic pricing error:', error);
      return this.mockDynamicPricing(tripDetails);
    }
  }

  // Smart Matching
  async matchDriverPassenger(passengerRequest) {
    try {
      const response = await this.apiClient.post('/smart-matching', {
        ...passengerRequest,
        algorithm: 'ml-optimized',
      });
      return response.data;
    } catch (error) {
      console.error('Smart matching error:', error);
      return this.mockSmartMatching(passengerRequest);
    }
  }

  // Predictive Analytics
  async getPredictiveAnalytics(timeframe = '24h') {
    try {
      const response = await this.apiClient.get(`/predictive-analytics?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      console.error('Predictive analytics error:', error);
      return this.mockPredictiveAnalytics();
    }
  }

  // Mock responses for development/fallback
  mockChatResponse(message) {
    const responses = {
      'book ride': 'I can help you book a ride! Where would you like to go?',
      'cancel trip': 'I can help you cancel your trip. Let me find your active bookings.',
      'driver location': 'Your driver is 3 minutes away. I\'ll send you live updates.',
      'fare estimate': 'Based on current demand, your estimated fare is $12-15.',
      default: 'I\'m here to help with your ride needs. You can ask me about booking, canceling, or tracking rides.',
    };

    const key = Object.keys(responses).find(k => 
      message.toLowerCase().includes(k) && k !== 'default'
    ) || 'default';

    return {
      response: responses[key],
      confidence: 0.85,
      suggestions: ['Book a ride', 'Track my driver', 'Cancel trip', 'Fare estimate'],
      timestamp: new Date().toISOString(),
    };
  }

  mockRouteOptimization(waypoints) {
    return {
      optimizedRoute: waypoints,
      estimatedTime: Math.floor(Math.random() * 30) + 10,
      estimatedDistance: Math.floor(Math.random() * 20) + 5,
      fuelEfficiency: 'High',
      trafficConditions: 'Moderate',
      alternativeRoutes: 2,
    };
  }

  mockDemandPrediction(location) {
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

  mockDynamicPricing(tripDetails) {
    const basePrice = 8.50;
    const surgeMultiplier = Math.random() * 2 + 1;
    return {
      basePrice,
      surgeMultiplier,
      finalPrice: basePrice * surgeMultiplier,
      factors: {
        demand: 'High',
        weather: 'Clear',
        events: 'Concert nearby',
        traffic: 'Heavy',
      },
      priceBreakdown: {
        baseFare: basePrice,
        distanceRate: 2.50,
        timeRate: 1.20,
        surge: (basePrice * surgeMultiplier) - basePrice,
      },
    };
  }

  mockSmartMatching(passengerRequest) {
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
      matchingFactors: {
        proximity: 0.9,
        rating: 0.85,
        vehicleType: 0.8,
        availability: 0.95,
      },
    };
  }

  mockPredictiveAnalytics() {
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