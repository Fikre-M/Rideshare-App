// Mock OpenAI API for tests
export const mockOpenAIResponses = {
  matching: {
    choices: [{
      message: {
        content: JSON.stringify([
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
              vehicleMatch: 100,
              eta: 75,
              availability: 90
            },
            estimatedArrival: 5,
            vehicle: {
              type: 'sedan',
              make: 'Honda',
              model: 'Accord',
              year: 2021,
              color: 'Black'
            }
          }
        ])
      }
    }],
    usage: { total_tokens: 150 }
  },
  
  pricing: {
    choices: [{
      message: {
        content: JSON.stringify({
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
          reasoning: 'High demand due to rain and nearby events'
        })
      }
    }],
    usage: { total_tokens: 120 }
  },
  
  routing: {
    choices: [{
      message: {
        content: JSON.stringify({
          recommendedRouteIndex: 0,
          reasoning: 'Fastest route with minimal traffic delays',
          routeAnalysis: [
            {
              routeIndex: 0,
              score: 95,
              pros: ['Fastest', 'Highway route', 'Less traffic'],
              cons: ['Tolls required'],
              estimatedTime: 25,
              trafficImpact: 'low'
            },
            {
              routeIndex: 1,
              score: 80,
              pros: ['No tolls', 'Scenic route'],
              cons: ['Longer distance', 'More traffic lights'],
              estimatedTime: 35,
              trafficImpact: 'moderate'
            }
          ]
        })
      }
    }],
    usage: { total_tokens: 180 }
  },
  
  demand: {
    choices: [{
      message: {
        content: JSON.stringify({
          predictions: [
            { hour: 14, demand: 0.7, confidence: 0.85 },
            { hour: 15, demand: 0.8, confidence: 0.82 },
            { hour: 16, demand: 0.9, confidence: 0.88 },
            { hour: 17, demand: 0.95, confidence: 0.90 },
            { hour: 18, demand: 0.85, confidence: 0.87 },
            { hour: 19, demand: 0.6, confidence: 0.80 }
          ],
          peakHours: [17, 18],
          insights: 'Rush hour peak expected at 5-6 PM',
          recommendations: ['Deploy more drivers during peak hours', 'Consider surge pricing']
        })
      }
    }],
    usage: { total_tokens: 140 }
  },
  
  analytics: {
    choices: [{
      message: {
        content: JSON.stringify({
          revenue: {
            today: { projected: 15000, actual: 12000, variance: -20 },
            week: { projected: 105000, actual: 98000, variance: -6.7 },
            month: { projected: 450000, confidence: 0.85 }
          },
          utilization: {
            current: 0.75,
            peak: 0.92,
            average: 0.68,
            trend: 'increasing'
          },
          insights: [
            'Revenue slightly below target due to weather',
            'Driver utilization improving',
            'Peak hours showing strong performance'
          ],
          recommendations: [
            'Increase marketing during off-peak hours',
            'Consider driver incentives for rainy days'
          ]
        })
      }
    }],
    usage: { total_tokens: 200 }
  }
};

// Mock OpenAI class
export default class MockOpenAI {
  constructor(config: any) {
    this.apiKey = config.apiKey;
  }

  chat = {
    completions: {
      create: jest.fn().mockImplementation(async (params) => {
        const content = params.messages[0].content;
        
        if (content.includes('match') || content.includes('driver')) {
          return mockOpenAIResponses.matching;
        }
        if (content.includes('pricing') || content.includes('surge')) {
          return mockOpenAIResponses.pricing;
        }
        if (content.includes('route') || content.includes('optimize')) {
          return mockOpenAIResponses.routing;
        }
        if (content.includes('demand') || content.includes('predict')) {
          return mockOpenAIResponses.demand;
        }
        if (content.includes('analytics') || content.includes('revenue')) {
          return mockOpenAIResponses.analytics;
        }
        
        // Default response
        return {
          choices: [{ message: { content: 'Mock response' } }],
          usage: { total_tokens: 50 }
        };
      })
    }
  };
}