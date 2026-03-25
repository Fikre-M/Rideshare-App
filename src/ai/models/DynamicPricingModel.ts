// @ts-nocheck
import * as tf from '@tensorflow/tfjs';

class DynamicPricingModel {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any = null;
  isInitialized = false;
  basePrice = 8.50;

  constructor() {}

  async initialize() {
    if (this.isInitialized) return;

    // Create a model for dynamic pricing
    this.model = tf.sequential({
      layers: [
        // Input layer: pricing factors
        tf.layers.dense({ inputShape: [10], units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 24, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 8, activation: 'relu' }),
        // Output layer: price multiplier (1.0 = base price, >1.0 = surge)
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });

    // Compile the model
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    // Train with synthetic pricing data
    await this.trainWithSyntheticData();
    this.isInitialized = true;
  }

  async trainWithSyntheticData() {
    const numSamples = 3000;
    const features = [];
    const labels = [];

    for (let i = 0; i < numSamples; i++) {
      const hour = Math.random() * 24;
      const dayOfWeek = Math.random() * 7;
      const demandLevel = Math.random(); // 0-1
      const supplyLevel = Math.random(); // 0-1
      const weatherCondition = Math.random(); // 0-1 (0=bad, 1=good)
      const hasEvent = Math.random() > 0.85 ? 1 : 0; // 15% chance
      const isWeekend = dayOfWeek >= 5 ? 1 : 0;
      const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19) ? 1 : 0;
      const distance = Math.random() * 15 + 1; // 1-16 km
      const locationType = Math.floor(Math.random() * 3); // 0: downtown, 1: suburban, 2: airport

      // Calculate price multiplier based on factors
      let multiplier = 1.0;

      // Demand-supply balance
      const demandSupplyRatio = demandLevel / (supplyLevel + 0.1);
      multiplier += (demandSupplyRatio - 1) * 0.5;

      // Time-based factors
      if (isRushHour) multiplier *= 1.3;
      if (hour >= 22 || hour <= 5) multiplier *= 0.8;

      // Day-based factors
      if (isWeekend) multiplier *= 1.1;

      // Weather impact
      if (weatherCondition < 0.3) multiplier *= 1.2; // Bad weather increases demand

      // Event impact
      if (hasEvent) multiplier *= 1.4;

      // Location impact
      if (locationType === 0) multiplier *= 1.2; // Downtown premium
      if (locationType === 2) multiplier *= 1.3; // Airport premium

      // Distance factor (longer rides get slight discount per km)
      multiplier *= (1 - distance * 0.01);

      // Add some randomness
      multiplier += (Math.random() - 0.5) * 0.1;

      // Ensure multiplier is reasonable (0.5 to 3.0)
      multiplier = Math.max(0.5, Math.min(3.0, multiplier));

      features.push([hour, dayOfWeek, demandLevel, supplyLevel, weatherCondition, hasEvent, isWeekend, isRushHour, distance, locationType]);
      labels.push([multiplier]);
    }

    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels);

    // Train the model
    await this.model.fit(xs, ys, {
      epochs: 60,
      batchSize: 32,
      validationSplit: 0.2,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            console.log(`Pricing Model Epoch ${epoch}: Loss = ${logs.loss.toFixed(4)}`);
          }
        }
      }
    });

    // Clean up tensors
    xs.dispose();
    ys.dispose();
  }

  async calculatePrice(tripDetails) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const currentTime = new Date();
    const features = this.extractFeatures(tripDetails, currentTime);
    
    // Normalize features for the model
    const normalizedFeatures = this.normalizeFeatures(features);
    
    // Make prediction
    const input = tf.tensor2d([normalizedFeatures]);
    const prediction = this.model.predict(input);
    const multiplier = await prediction.data();
    
    // Clean up tensors
    input.dispose();
    prediction.dispose();

    const finalMultiplier = multiplier[0];
    const finalPrice = this.basePrice * finalMultiplier;

    return {
      basePrice: this.basePrice,
      multiplier: finalMultiplier,
      finalPrice: Math.round(finalPrice * 100) / 100, // Round to 2 decimal places
      factors: this.getPricingFactors(features, finalMultiplier),
      priceBreakdown: this.getPriceBreakdown(tripDetails, finalMultiplier),
      confidence: this.calculateConfidence(features)
    };
  }

  extractFeatures(tripDetails, currentTime) {
    const hour = currentTime.getHours();
    const dayOfWeek = currentTime.getDay();
    
    return {
      hour,
      dayOfWeek,
      demandLevel: tripDetails.demandLevel || Math.random(),
      supplyLevel: tripDetails.supplyLevel || Math.random(),
      weatherCondition: tripDetails.weatherCondition || 0.8,
      hasEvent: tripDetails.hasEvent ? 1 : 0,
      isWeekend: dayOfWeek >= 5 ? 1 : 0,
      isRushHour: (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19) ? 1 : 0,
      distance: tripDetails.distance || 5,
      locationType: tripDetails.locationType || 0
    };
  }

  normalizeFeatures(features) {
    return [
      features.hour / 24,                    // Normalize hour to 0-1
      features.dayOfWeek / 7,                // Normalize day to 0-1
      features.demandLevel,                  // Already 0-1
      features.supplyLevel,                  // Already 0-1
      features.weatherCondition,             // Already 0-1
      features.hasEvent,                     // Already 0-1
      features.isWeekend,                    // Already 0-1
      features.isRushHour,                    // Already 0-1
      Math.min(features.distance / 20, 1),   // Normalize distance, cap at 20km
      features.locationType / 2               // Normalize location type 0-2 to 0-1
    ];
  }

  getPricingFactors(features, multiplier) {
    const factors = {};
    
    if (features.isRushHour) factors.timeOfDay = 'Rush Hour Pricing';
    else if (features.hour >= 22 || features.hour <= 5) factors.timeOfDay = 'Night Time Discount';
    else factors.timeOfDay = 'Standard Time';
    
    if (features.demandLevel > 0.7) factors.demand = 'High Demand';
    else if (features.demandLevel < 0.3) factors.demand = 'Low Demand';
    else factors.demand = 'Normal Demand';
    
    if (features.weatherCondition < 0.3) factors.weather = 'Poor Weather';
    else factors.weather = 'Good Weather';
    
    if (features.hasEvent) factors.events = 'Event Pricing';
    
    if (features.isWeekend) factors.weekend = 'Weekend Pricing';
    
    const locationNames = ['Downtown', 'Suburban', 'Airport'];
    factors.location = locationNames[features.locationType];
    
    if (multiplier > 1.5) factors.surge = 'High Surge Applied';
    else if (multiplier > 1.2) factors.surge = 'Moderate Surge Applied';
    else factors.surge = 'No Surge';
    
    return factors;
  }

  getPriceBreakdown(tripDetails, multiplier) {
    const distance = tripDetails.distance || 5;
    const estimatedTime = distance * 3; // Rough estimate: 3 minutes per km
    
    return {
      baseFare: this.basePrice,
      distanceRate: Math.round(distance * 0.5 * 100) / 100,
      timeRate: Math.round(estimatedTime * 0.1 * 100) / 100,
      surge: Math.round((this.basePrice * multiplier - this.basePrice) * 100) / 100,
      totalBeforeSurge: this.basePrice + (distance * 0.5) + (estimatedTime * 0.1)
    };
  }

  calculateConfidence(features) {
    // Calculate confidence based on how "normal" the situation is
    let confidence = 0.8; // Base confidence
    
    // High confidence for normal situations
    if (!features.isRushHour && !features.hasEvent && features.demandLevel > 0.3 && features.demandLevel < 0.7) {
      confidence = 0.95;
    }
    
    // Lower confidence for extreme situations
    if (features.demandLevel > 0.9 || features.supplyLevel < 0.1) {
      confidence = 0.7;
    }
    
    return confidence;
  }

  async getPriceTrends(location = 'downtown', hours = 24) {
    const trends = [];
    const currentTime = new Date();
    
    for (let i = 0; i < hours; i++) {
      const futureTime = new Date(currentTime.getTime() + i * 60 * 60 * 1000);
      const tripDetails = {
        locationType: location === 'downtown' ? 0 : location === 'suburban' ? 1 : 2,
        distance: 5,
        demandLevel: 0.5 + Math.sin(i / 4) * 0.3, // Simulated demand pattern
        supplyLevel: 0.5 + Math.cos(i / 3) * 0.2  // Simulated supply pattern
      };
      
      const pricing = await this.calculatePrice(tripDetails);
      trends.push({
        hour: futureTime.getHours(),
        price: pricing.finalPrice,
        multiplier: pricing.multiplier,
        confidence: pricing.confidence
      });
    }
    
    return trends;
  }

  getModelInfo() {
    return {
      type: 'Dynamic Pricing Neural Network',
      inputFeatures: ['hour', 'dayOfWeek', 'demandLevel', 'supplyLevel', 'weatherCondition', 'hasEvent', 'isWeekend', 'isRushHour', 'distance', 'locationType'],
      output: 'priceMultiplier',
      architecture: this.model ? this.model.layers.map(layer => layer.name) : [],
      isInitialized: this.isInitialized,
      basePrice: this.basePrice
    };
  }

  dispose() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      this.isInitialized = false;
    }
  }
}

export default new DynamicPricingModel();
