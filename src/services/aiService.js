// AI Service Layer - Handles all AI/ML API interactions with TensorFlow.js
import axios from 'axios';
import MLAIService from '../ai/services/MLAIService';
import googleAIService from './googleAIService';

const AI_API_BASE = import.meta.env.VITE_AI_API_URL || 'http://localhost:8001/api/ai';
const USE_ML_MODELS = import.meta.env.VITE_USE_ML_MODELS !== 'false'; // Default to true

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

    // Initialize ML Service
    this.mlService = MLAIService;
    this.mlInitialized = false;
  }

  // AI Chat Interface
  async sendChatMessage(message, context = {}) {
    try {
      // Use Google AI service for chat
      return await googleAIService.sendChatMessage(message, context.conversationId);
    } catch (error) {
      console.error('Chat AI error:', error);
      // Fallback to mock response
      return googleAIService.getMockResponse(message);
    }
  }

  // Route Optimization
  async optimizeRoute(waypoints, preferences = {}) {
    try {
      if (USE_ML_MODELS) {
        if (!this.mlInitialized) {
          await this.mlService.initialize();
          this.mlInitialized = true;
        }
        return await this.mlService.optimizeRoute(waypoints, preferences);
      }
      
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
      if (USE_ML_MODELS) {
        if (!this.mlInitialized) {
          await this.mlService.initialize();
          this.mlInitialized = true;
        }
        return await this.mlService.predictDemand(location, timeRange);
      }
      
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
      if (USE_ML_MODELS) {
        if (!this.mlInitialized) {
          await this.mlService.initialize();
          this.mlInitialized = true;
        }
        return await this.mlService.calculateDynamicPrice(tripDetails);
      }
      
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
      if (USE_ML_MODELS) {
        if (!this.mlInitialized) {
          await this.mlService.initialize();
          this.mlInitialized = true;
        }
        return await this.mlService.matchDriverPassenger(passengerRequest);
      }
      
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
      if (USE_ML_MODELS) {
        if (!this.mlInitialized) {
          await this.mlService.initialize();
          this.mlInitialized = true;
        }
        return await this.mlService.getPredictiveAnalytics(timeframe);
      }
      
      const response = await this.apiClient.get(`/predictive-analytics?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      console.error('Predictive analytics error:', error);
      return this.mockPredictiveAnalytics();
    }
  }

  // Mock responses for development/fallback
  mockChatResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    let response = '';
    let suggestions = ['Book a ride', 'Track my driver', 'Cancel trip', 'Fare estimate'];
    
    if (lowerMessage.includes('book') || lowerMessage.includes('ride')) {
      response = '🚗 I can help you book a ride! Where would you like to go? Please provide your pickup location and destination.';
      suggestions = ['Downtown to Airport', 'Home to Office', 'Mall to Restaurant', 'Get fare estimate'];
    } else if (lowerMessage.includes('cancel') || lowerMessage.includes('trip')) {
      response = '❌ I can help you cancel your trip. Let me find your active bookings. Do you want to cancel your current ride?';
      suggestions = ['Yes, cancel ride', 'No, keep ride', 'View my trips', 'Contact driver'];
    } else if (lowerMessage.includes('driver') || lowerMessage.includes('track')) {
      response = '📍 Your driver John is 3 minutes away! 🚙 Vehicle: Blue Toyota Camry (ABC-123). I\'ll send you live updates on their location.';
      suggestions = ['Call driver', 'Share trip', 'View route', 'Cancel trip'];
    } else if (lowerMessage.includes('fare') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      response = '💰 Based on current demand and distance, your estimated fare is $12-15. This includes base fare, distance, and time charges.';
      suggestions = ['Book this ride', 'Compare prices', 'View breakdown', 'Choose vehicle type'];
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      response = '👋 Hello! I\'m your AI rideshare assistant. I can help you book rides, track drivers, get fare estimates, and manage your trips. What would you like to do?';
      suggestions = ['Book a ride', 'Track my driver', 'Fare estimate', 'View trip history'];
    } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      response = '🆘 I\'m here to help! I can assist you with:\n• Booking new rides\n• Tracking your current driver\n• Getting fare estimates\n• Managing your trips\n• Answering questions about our service\n\nWhat do you need help with?';
      suggestions = ['Book a ride', 'Track driver', 'Payment issues', 'Account settings'];
    } else if (lowerMessage.includes('payment') || lowerMessage.includes('card')) {
      response = '💳 I can help with payment issues. You can add, remove, or update payment methods in your account settings. What payment issue are you experiencing?';
      suggestions = ['Add payment method', 'Update card', 'Payment failed', 'View receipts'];
    } else if (lowerMessage.includes('account') || lowerMessage.includes('profile')) {
      response = '👤 For account settings, you can update your profile, payment methods, and preferences in the app settings. What would you like to change?';
      suggestions = ['Update profile', 'Change password', 'Payment methods', 'Notification settings'];
    } else {
      response = '🤖 I\'m here to help with your ride needs! I can assist you with booking rides, tracking drivers, fare estimates, and managing your trips. What would you like to do?';
      suggestions = ['Book a ride', 'Track my driver', 'Fare estimate', 'Get help'];
    }

    return {
      response,
      confidence: Math.random() * 0.3 + 0.7, // Random confidence between 0.7-1.0
      suggestions,
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