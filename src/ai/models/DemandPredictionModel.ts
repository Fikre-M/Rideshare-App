// @ts-nocheck
import * as tf from '@tensorflow/tfjs';

class DemandPredictionModel {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any = null;
  isInitialized = false;

  constructor() {}

  async initialize() {
    if (this.isInitialized) return;

    // Create a sequential model for demand prediction
    this.model = tf.sequential({
      layers: [
        // Input layer: features like hour, dayOfWeek, weather, events
        tf.layers.dense({ inputShape: [8], units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 8, activation: 'relu' }),
        // Output layer: predicted demand
        tf.layers.dense({ units: 1, activation: 'linear' })
      ]
    });

    // Compile the model
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    // Train with synthetic data
    await this.trainWithSyntheticData();
    this.isInitialized = true;
  }

  async trainWithSyntheticData() {
    // Generate synthetic training data
    const numSamples = 1000;
    const features = [];
    const labels = [];

    for (let i = 0; i < numSamples; i++) {
      const hour = Math.floor(Math.random() * 24);
      const dayOfWeek = Math.floor(Math.random() * 7);
      const isWeekend = dayOfWeek >= 5 ? 1 : 0;
      const weather = Math.random(); // 0-1 (bad to good)
      const temperature = Math.random() * 40 - 10; // -10 to 30°C
      const hasEvent = Math.random() > 0.8 ? 1 : 0;
      const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19) ? 1 : 0;
      const locationType = Math.floor(Math.random() * 3); // 0: downtown, 1: suburban, 2: airport

      // Calculate demand based on patterns
      let baseDemand = 20;
      
      // Time-based patterns
      if (isRushHour) baseDemand *= 2.5;
      if (hour >= 22 || hour <= 5) baseDemand *= 0.3;
      
      // Day-based patterns
      if (isWeekend) baseDemand *= 1.3;
      
      // Weather impact
      baseDemand *= (0.5 + weather * 0.5);
      
      // Event impact
      if (hasEvent) baseDemand *= 1.8;
      
      // Location impact
      if (locationType === 0) baseDemand *= 1.5; // downtown
      if (locationType === 2) baseDemand *= 1.2; // airport

      // Add some noise
      const demand = baseDemand + (Math.random() - 0.5) * 10;

      features.push([hour, dayOfWeek, isWeekend, weather, temperature, hasEvent, isRushHour, locationType]);
      labels.push([Math.max(0, demand)]);
    }

    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels);

    // Train the model
    await this.model.fit(xs, ys, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
      shuffle: true,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            console.log(`Epoch ${epoch}: Loss = ${logs.loss.toFixed(4)}`);
          }
        }
      }
    });

    // Clean up tensors
    xs.dispose();
    ys.dispose();
  }

  async predictDemand(features) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Normalize input features
    const normalizedFeatures = this.normalizeFeatures(features);
    
    // Make prediction
    const input = tf.tensor2d([normalizedFeatures]);
    const prediction = this.model.predict(input);
    const demand = await prediction.data();
    
    // Clean up tensors
    input.dispose();
    prediction.dispose();

    return Math.max(0, demand[0]);
  }

  normalizeFeatures(features) {
    const [hour, dayOfWeek, isWeekend, weather, temperature, hasEvent, isRushHour, locationType] = features;
    
    return [
      hour / 24,                    // Normalize hour to 0-1
      dayOfWeek / 7,                // Normalize day of week to 0-1
      isWeekend,                    // Already 0-1
      weather,                      // Already 0-1
      (temperature + 10) / 40,      // Normalize temperature -10 to 30°C to 0-1
      hasEvent,                     // Already 0-1
      isRushHour,                   // Already 0-1
      locationType / 2              // Normalize location type 0-2 to 0-1
    ];
  }

  async predictDemandForDay(location, date = new Date()) {
    const predictions = [];
    
    for (let hour = 0; hour < 24; hour++) {
      const features = [
        hour,                                    // hour
        date.getDay(),                          // dayOfWeek
        date.getDay() >= 5 ? 1 : 0,             // isWeekend
        0.7,                                    // weather (default good)
        20,                                     // temperature (default)
        Math.random() > 0.9 ? 1 : 0,            // hasEvent (10% chance)
        (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19) ? 1 : 0, // isRushHour
        location === 'downtown' ? 0 : location === 'suburban' ? 1 : 2 // locationType
      ];
      
      const demand = await this.predictDemand(features);
      predictions.push({
        hour,
        demand: Math.round(demand),
        confidence: 0.8 + Math.random() * 0.2 // Simulated confidence
      });
    }
    
    return predictions;
  }

  getModelInfo() {
    return {
      type: 'Demand Prediction Neural Network',
      inputFeatures: ['hour', 'dayOfWeek', 'isWeekend', 'weather', 'temperature', 'hasEvent', 'isRushHour', 'locationType'],
      output: 'predictedDemand',
      architecture: this.model ? this.model.layers.map(layer => layer.name) : [],
      isInitialized: this.isInitialized
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

export default new DemandPredictionModel();
