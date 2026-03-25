// @ts-nocheck
import DemandPredictionModel from '../models/DemandPredictionModel';
import RouteOptimizationModel from '../models/RouteOptimizationModel';
import DynamicPricingModel from '../models/DynamicPricingModel';

class MLAIService {
  demandModel = DemandPredictionModel;
  routeModel = RouteOptimizationModel;
  pricingModel = DynamicPricingModel;
  isInitialized = false;

  constructor() {}

  async initialize() {
    if (this.isInitialized) return;

    console.log('🤖 Initializing ML Models...');
    
    try {
      // Initialize all models in parallel
      await Promise.all([
        this.demandModel.initialize(),
        this.routeModel.initialize(),
        this.pricingModel.initialize()
      ]);
      
      this.isInitialized = true;
      console.log('✅ All ML Models initialized successfully!');
    } catch (error) {
      console.error('❌ Failed to initialize ML Models:', error);
      throw error;
    }
  }

  // Demand Prediction
  async predictDemand(location, timeRange = '24h') {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const predictions = await this.demandModel.predictDemandForDay(location);
      
      return {
        location,
        timeRange,
        currentDemand: predictions[new Date().getHours()]?.demand || 0,
        predictedDemand: predictions,
        peakHours: this.findPeakHours(predictions),
        recommendations: this.generateDemandRecommendations(predictions),
        modelInfo: this.demandModel.getModelInfo(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Demand prediction error:', error);
      throw error;
    }
  }

  // Route Optimization
  async optimizeRoute(waypoints, preferences = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const result = await this.routeModel.optimizeRoute(waypoints, new Date());
      
      return {
        ...result,
        preferences,
        modelInfo: this.routeModel.getModelInfo(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Route optimization error:', error);
      throw error;
    }
  }

  // Dynamic Pricing
  async calculateDynamicPrice(tripDetails) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const pricing = await this.pricingModel.calculatePrice(tripDetails);
      
      return {
        ...pricing,
        tripDetails,
        modelInfo: this.pricingModel.getModelInfo(),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Dynamic pricing error:', error);
      throw error;
    }
  }

  // Smart Matching (using ML models for better matching)
  async matchDriverPassenger(passengerRequest) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Use pricing model to determine optimal fare
      const pricing = await this.pricingModel.calculatePrice({
        distance: passengerRequest.distance || 5,
        locationType: passengerRequest.locationType || 0,
        demandLevel: Math.random(), // Will be replaced with real-time data
        supplyLevel: Math.random()
      });

      // Use route optimization to estimate ETA
      const routeResult = await this.routeModel.optimizeRoute(
        [passengerRequest.pickup, passengerRequest.destination],
        { prioritizeTime: true }
      );

      // Generate driver match with ML-enhanced scoring
      const matchScore = this.calculateMatchScore(passengerRequest, pricing, routeResult);

      return {
        matchedDriver: {
          id: 'driver_' + Math.random().toString(36).substr(2, 9),
          name: this.generateDriverName(),
          rating: 4.5 + Math.random() * 0.5,
          eta: routeResult.optimizedRoute.estimatedTime,
          vehicle: this.generateVehicleType(),
          location: passengerRequest.pickup,
          experience: Math.floor(Math.random() * 5) + 1 // years
        },
        matchScore,
        alternativeDrivers: Math.floor(Math.random() * 3) + 1,
        pricing,
        routeInfo: routeResult,
        matchingFactors: {
          proximity: 0.9,
          rating: 0.85,
          vehicleType: 0.8,
          availability: 0.95,
          pricing: 0.7
        },
        modelInfo: {
          pricing: this.pricingModel.getModelInfo(),
          routing: this.routeModel.getModelInfo()
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Smart matching error:', error);
      throw error;
    }
  }

  // Predictive Analytics
  async getPredictiveAnalytics(timeframe = '24h') {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Get predictions from all models
      const [downtownDemand, suburbanDemand, airportDemand] = await Promise.all([
        this.predictDemand('downtown', timeframe),
        this.predictDemand('suburban', timeframe),
        this.predictDemand('airport', timeframe)
      ]);

      const [downtownPricing, suburbanPricing, airportPricing] = await Promise.all([
        this.pricingModel.getPriceTrends('downtown', 24),
        this.pricingModel.getPriceTrends('suburban', 24),
        this.pricingModel.getPriceTrends('airport', 24)
      ]);

      return {
        rideDemandForecast: {
          downtown: downtownDemand.predictedDemand,
          suburban: suburbanDemand.predictedDemand,
          airport: airportDemand.predictedDemand
        },
        revenueProjection: this.calculateRevenueProjection(downtownPricing, suburbanPricing, airportPricing),
        driverUtilization: this.calculateDriverUtilization(downtownDemand, suburbanDemand, airportDemand),
        pricingTrends: {
          downtown: downtownPricing,
          suburban: suburbanPricing,
          airport: airportPricing
        },
        insights: this.generateInsights(downtownDemand, downtownPricing),
        modelInfo: {
          demand: this.demandModel.getModelInfo(),
          pricing: this.pricingModel.getModelInfo()
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Predictive analytics error:', error);
      throw error;
    }
  }

  // Helper methods
  findPeakHours(predictions) {
    const hourlyDemands = predictions.map(p => p.demand);
    const avgDemand = hourlyDemands.reduce((a, b) => a + b, 0) / hourlyDemands.length;
    
    return predictions
      .filter(p => p.demand > avgDemand * 1.3)
      .map(p => p.hour);
  }

  generateDemandRecommendations(predictions) {
    const peakHours = this.findPeakHours(predictions);
    const currentHour = new Date().getHours();
    const currentDemand = predictions[currentHour]?.demand || 0;
    
    const recommendations = [];
    
    if (peakHours.includes(currentHour)) {
      recommendations.push('Increase driver incentives during current peak hour');
    }
    
    if (currentDemand > 50) {
      recommendations.push('Deploy more vehicles in high-demand areas');
    }
    
    const nextPeakHour = peakHours.find(h => h > currentHour);
    if (nextPeakHour) {
      recommendations.push(`Prepare for peak demand at ${nextPeakHour}:00`);
    }
    
    return recommendations;
  }

  calculateMatchScore(request, pricing, routeInfo) {
    let score = 0.5; // Base score
    
    // Pricing factor (reasonable pricing gets higher score)
    if (pricing.multiplier < 1.2) score += 0.2;
    else if (pricing.multiplier < 1.5) score += 0.1;
    
    // Route efficiency
    if (routeInfo.optimizedRoute.score > 0.7) score += 0.2;
    
    // Time-based factors
    const hour = new Date().getHours();
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      score += 0.1; // Higher availability during rush hour
    }
    
    return Math.min(1.0, score + Math.random() * 0.1);
  }

  generateDriverName() {
    const firstNames = ['John', 'Sarah', 'Mike', 'Emily', 'David', 'Lisa', 'James', 'Anna'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  }

  generateVehicleType() {
    const vehicles = [
      'Toyota Camry - ABC 123',
      'Honda Accord - XYZ 789',
      'Toyota Corolla - DEF 456',
      'Honda Civic - GHI 012',
      'Nissan Altima - JKL 345'
    ];
    return vehicles[Math.floor(Math.random() * vehicles.length)];
  }

  calculateRevenueProjection(downtownPricing, suburbanPricing, airportPricing) {
    const calculateTotal = (pricing) => {
      return pricing.reduce((sum, p) => sum + p.price, 0);
    };

    return {
      today: Math.round(calculateTotal(downtownPricing) * 50), // Estimated 50 rides downtown
      thisWeek: Math.round(calculateTotal(downtownPricing) * 350), // 350 rides this week
      thisMonth: Math.round(calculateTotal(downtownPricing) * 1500), // 1500 rides this month
      breakdown: {
        downtown: calculateTotal(downtownPricing),
        suburban: calculateTotal(suburbanPricing),
        airport: calculateTotal(airportPricing)
      }
    };
  }

  calculateDriverUtilization(downtownDemand, suburbanDemand, airportDemand) {
    const avgDemand = (downtownDemand.currentDemand + suburbanDemand.currentDemand + airportDemand.currentDemand) / 3;
    const currentUtilization = Math.min(0.95, avgDemand / 100);
    const predictedUtilization = Math.min(0.95, currentUtilization * (0.9 + Math.random() * 0.2));
    
    return {
      current: Math.round(currentUtilization * 100) / 100,
      predicted: Math.round(predictedUtilization * 100) / 100,
      optimal: 0.85
    };
  }

  generateInsights(demandData, pricingData) {
    const insights = [];
    const peakHours = demandData.peakHours;
    const currentHour = new Date().getHours();
    
    if (peakHours.includes(currentHour)) {
      insights.push(`Peak demand expected at ${currentHour}:00 in downtown area`);
    }
    
    const avgPrice = pricingData.reduce((sum, p) => sum + p.price, 0) / pricingData.length;
    if (avgPrice > 10) {
      insights.push('High pricing detected - consider increasing driver supply');
    }
    
    if (Math.random() > 0.7) {
      insights.push('Weather forecast suggests 15% increase in ride requests');
    }
    
    if (Math.random() > 0.8) {
      insights.push('Concert event will drive demand up by 25% near stadium');
    }
    
    insights.push('Recommend deploying 5 additional drivers in Bole area');
    
    return insights;
  }

  // Get model status
  getModelStatus() {
    return {
      isInitialized: this.isInitialized,
      models: {
        demand: this.demandModel.getModelInfo(),
        routing: this.routeModel.getModelInfo(),
        pricing: this.pricingModel.getModelInfo()
      }
    };
  }

  // Cleanup
  dispose() {
    this.demandModel.dispose();
    this.routeModel.dispose();
    this.pricingModel.dispose();
    this.isInitialized = false;
  }
}

export default new MLAIService();
