import DemandPredictionModel from '../models/DemandPredictionModel';
import RouteOptimizationModel from '../models/RouteOptimizationModel';
import DynamicPricingModel from '../models/DynamicPricingModel';

interface Coordinate { lat: number; lng: number; }
interface HourlyDemand { hour: number; demand: number; }
interface PricingResult { multiplier: number; [key: string]: unknown; }
interface RouteResult { optimizedRoute: { estimatedTime: number; score: number }; [key: string]: unknown; }

interface PassengerRequest {
  distance?: number;
  locationType?: number;
  pickup?: Coordinate;
  destination?: Coordinate;
  [key: string]: unknown;
}

/** Deterministic fixture drivers — no Math.random() */
const FIXTURE_DRIVERS = [
  { id: 'driver_001', name: 'John Smith',    rating: 4.8, vehicle: 'Toyota Camry - ABC 123' },
  { id: 'driver_002', name: 'Sarah Johnson', rating: 4.9, vehicle: 'Honda CR-V - XYZ 789'   },
  { id: 'driver_003', name: 'Michael Chen',  rating: 4.7, vehicle: 'Nissan Altima - DEF 456' },
  { id: 'driver_004', name: 'Emily Davis',   rating: 4.6, vehicle: 'Toyota Corolla - GHI 012' },
  { id: 'driver_005', name: 'James Wilson',  rating: 4.8, vehicle: 'Honda Civic - JKL 345'   },
];

/** Pick a driver deterministically based on current minute so it's stable within a session */
const getFixtureDriver = () => FIXTURE_DRIVERS[new Date().getMinutes() % FIXTURE_DRIVERS.length];

class MLAIService {
  demandModel = DemandPredictionModel;
  routeModel = RouteOptimizationModel;
  pricingModel = DynamicPricingModel;
  isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    console.log('🤖 Initializing ML Models...');
    try {
      await Promise.all([
        this.demandModel.initialize(),
        this.routeModel.initialize(),
        this.pricingModel.initialize(),
      ]);
      this.isInitialized = true;
      console.log('✅ All ML Models initialized successfully!');
    } catch (error) {
      console.error('❌ Failed to initialize ML Models:', error);
      throw error;
    }
  }

  async predictDemand(location: string, timeRange = '24h'): Promise<unknown> {
    if (!this.isInitialized) await this.initialize();
    const predictions = await this.demandModel.predictDemandForDay(location) as HourlyDemand[];
    return {
      location, timeRange,
      currentDemand: predictions[new Date().getHours()]?.demand ?? 0,
      predictedDemand: predictions,
      peakHours: this.findPeakHours(predictions),
      recommendations: this.generateDemandRecommendations(predictions),
      modelInfo: this.demandModel.getModelInfo(),
      timestamp: new Date().toISOString(),
    };
  }

  async optimizeRoute(waypoints: Coordinate[], preferences: Record<string, unknown> = {}): Promise<unknown> {
    if (!this.isInitialized) await this.initialize();
    const result = await this.routeModel.optimizeRoute(waypoints, new Date()) as RouteResult;
    return { ...result, preferences, modelInfo: this.routeModel.getModelInfo(), timestamp: new Date().toISOString() };
  }

  async calculateDynamicPrice(tripDetails: Record<string, unknown>): Promise<unknown> {
    if (!this.isInitialized) await this.initialize();
    const pricing = await this.pricingModel.calculatePrice(tripDetails) as PricingResult;
    return { ...pricing, tripDetails, modelInfo: this.pricingModel.getModelInfo(), timestamp: new Date().toISOString() };
  }

  async matchDriverPassenger(passengerRequest: PassengerRequest): Promise<unknown> {
    if (!this.isInitialized) await this.initialize();

    const pricing = await this.pricingModel.calculatePrice({
      distance: passengerRequest.distance ?? 5,
      locationType: passengerRequest.locationType ?? 0,
      demandLevel: 0.65,  // deterministic: moderate demand
      supplyLevel: 0.70,  // deterministic: good supply
    }) as PricingResult;

    const routeResult = await this.routeModel.optimizeRoute(
      [passengerRequest.pickup, passengerRequest.destination],
      { prioritizeTime: true } as unknown as Date
    ) as RouteResult;

    const driver = getFixtureDriver();
    const matchScore = this.calculateMatchScore(pricing, routeResult);

    return {
      matchedDriver: {
        id: driver.id,
        name: driver.name,
        rating: driver.rating,
        eta: routeResult.optimizedRoute.estimatedTime,
        vehicle: driver.vehicle,
        location: passengerRequest.pickup,
        experience: 3,
      },
      matchScore,
      alternativeDrivers: 2,
      pricing,
      routeInfo: routeResult,
      matchingFactors: { proximity: 0.90, rating: 0.85, vehicleType: 0.80, availability: 0.95, pricing: 0.70 },
      modelInfo: { pricing: this.pricingModel.getModelInfo(), routing: this.routeModel.getModelInfo() },
      timestamp: new Date().toISOString(),
    };
  }

  async getPredictiveAnalytics(timeframe = '24h'): Promise<unknown> {
    if (!this.isInitialized) await this.initialize();

    const [downtownDemand, suburbanDemand, airportDemand] = await Promise.all([
      this.predictDemand('downtown', timeframe),
      this.predictDemand('suburban', timeframe),
      this.predictDemand('airport', timeframe),
    ]) as Array<{ predictedDemand: HourlyDemand[]; currentDemand: number; peakHours: number[] }>;

    const [downtownPricing, suburbanPricing, airportPricing] = await Promise.all([
      this.pricingModel.getPriceTrends('downtown', 24),
      this.pricingModel.getPriceTrends('suburban', 24),
      this.pricingModel.getPriceTrends('airport', 24),
    ]) as Array<Array<{ price: number }>>;

    return {
      rideDemandForecast: {
        downtown: downtownDemand.predictedDemand,
        suburban: suburbanDemand.predictedDemand,
        airport: airportDemand.predictedDemand,
      },
      revenueProjection: this.calculateRevenueProjection(downtownPricing, suburbanPricing, airportPricing),
      driverUtilization: this.calculateDriverUtilization(downtownDemand.currentDemand, suburbanDemand.currentDemand, airportDemand.currentDemand),
      pricingTrends: { downtown: downtownPricing, suburban: suburbanPricing, airport: airportPricing },
      insights: this.generateInsights(downtownDemand.peakHours, downtownPricing),
      modelInfo: { demand: this.demandModel.getModelInfo(), pricing: this.pricingModel.getModelInfo() },
      timestamp: new Date().toISOString(),
    };
  }

  // ── helpers ──────────────────────────────────────────────────────────────

  private findPeakHours(predictions: HourlyDemand[]): number[] {
    const avg = predictions.reduce((s, p) => s + p.demand, 0) / predictions.length;
    return predictions.filter(p => p.demand > avg * 1.3).map(p => p.hour);
  }

  private generateDemandRecommendations(predictions: HourlyDemand[]): string[] {
    const peakHours = this.findPeakHours(predictions);
    const currentHour = new Date().getHours();
    const recs: string[] = [];
    if (peakHours.includes(currentHour)) recs.push('Increase driver incentives during current peak hour');
    if ((predictions[currentHour]?.demand ?? 0) > 50) recs.push('Deploy more vehicles in high-demand areas');
    const next = peakHours.find(h => h > currentHour);
    if (next) recs.push(`Prepare for peak demand at ${next}:00`);
    return recs;
  }

  private calculateMatchScore(pricing: PricingResult, routeInfo: RouteResult): number {
    let score = 0.5;
    if (pricing.multiplier < 1.2) score += 0.2;
    else if (pricing.multiplier < 1.5) score += 0.1;
    if (routeInfo.optimizedRoute.score > 0.7) score += 0.2;
    const hour = new Date().getHours();
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) score += 0.1;
    return Math.min(1.0, score);
  }

  private calculateRevenueProjection(
    downtown: Array<{ price: number }>,
    suburban: Array<{ price: number }>,
    airport: Array<{ price: number }>
  ) {
    const total = (arr: Array<{ price: number }>) => arr.reduce((s, p) => s + p.price, 0);
    return {
      today:     Math.round(total(downtown) * 50),
      thisWeek:  Math.round(total(downtown) * 350),
      thisMonth: Math.round(total(downtown) * 1500),
      breakdown: { downtown: total(downtown), suburban: total(suburban), airport: total(airport) },
    };
  }

  private calculateDriverUtilization(downtown: number, suburban: number, airport: number) {
    const avg = (downtown + suburban + airport) / 3;
    const current = Math.min(0.95, avg / 100);
    return { current: Math.round(current * 100) / 100, predicted: Math.min(0.95, current * 1.05), optimal: 0.85 };
  }

  private generateInsights(peakHours: number[], pricingData: Array<{ price: number }>): string[] {
    const insights: string[] = [];
    const currentHour = new Date().getHours();
    if (peakHours.includes(currentHour)) insights.push(`Peak demand at ${currentHour}:00 in downtown area`);
    const avgPrice = pricingData.reduce((s, p) => s + p.price, 0) / (pricingData.length || 1);
    if (avgPrice > 10) insights.push('High pricing detected — consider increasing driver supply');
    insights.push('Recommend deploying 5 additional drivers in Bole area');
    return insights;
  }

  getModelStatus() {
    return {
      isInitialized: this.isInitialized,
      models: {
        demand: this.demandModel.getModelInfo(),
        routing: this.routeModel.getModelInfo(),
        pricing: this.pricingModel.getModelInfo(),
      },
    };
  }

  dispose() {
    this.demandModel.dispose();
    this.routeModel.dispose();
    this.pricingModel.dispose();
    this.isInitialized = false;
  }
}

export default new MLAIService();
