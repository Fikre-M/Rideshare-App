// OpenAI Service - Real AI integration for rideshare platform
import OpenAI from 'openai';
import { useApiKeyStore } from '../stores/apiKeyStore';

class OpenAIService {
  constructor() {
    this.client = null;
    this.tokenUsage = {
      total: 0,
      byFeature: {},
    };
  }

  // Initialize OpenAI client with user's API key
  initializeClient() {
    const apiKey = useApiKeyStore.getState().getKey('openAI');
    
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      throw new Error('OpenAI API key not configured. Please add your API key in settings.');
    }

    this.client = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true, // Required for browser usage
    });

    return this.client;
  }

  // Get or create client
  getClient() {
    if (!this.client) {
      return this.initializeClient();
    }
    return this.client;
  }

  // Track token usage
  trackTokenUsage(feature, usage) {
    if (!usage) return;

    const tokens = usage.total_tokens || 0;
    this.tokenUsage.total += tokens;
    
    if (!this.tokenUsage.byFeature[feature]) {
      this.tokenUsage.byFeature[feature] = 0;
    }
    this.tokenUsage.byFeature[feature] += tokens;
  }

  // Get token usage stats
  getTokenUsage() {
    return { ...this.tokenUsage };
  }

  // Reset token usage
  resetTokenUsage() {
    this.tokenUsage = {
      total: 0,
      byFeature: {},
    };
  }

  // SMART MATCHING: Match drivers to passengers with AI reasoning
  async matchDriverToPassenger(drivers, passengerPreferences) {
    try {
      const client = this.getClient();

      const prompt = `You are an AI rideshare matching system. Analyze the following drivers and passenger preferences to recommend the best matches.

DRIVERS:
${JSON.stringify(drivers, null, 2)}

PASSENGER PREFERENCES:
${JSON.stringify(passengerPreferences, null, 2)}

Analyze each driver based on:
1. Distance/proximity to passenger (lower is better)
2. Driver rating (higher is better)
3. Vehicle type match with passenger preference
4. Estimated arrival time
5. Driver availability and acceptance rate

Return a JSON array of matched drivers ranked from best to worst, with each match including:
- driverId: driver's ID
- driverName: driver's name
- matchScore: overall score 0-100
- reasoning: brief explanation of why this driver is a good match
- scores: object with individual scores for proximity, rating, vehicleMatch, eta, availability (each 0-100)
- estimatedArrival: estimated minutes until arrival
- vehicle: vehicle details

Return ONLY valid JSON, no additional text.`;

      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert rideshare matching algorithm. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      this.trackTokenUsage('smart_matching', response.usage);

      const result = JSON.parse(response.choices[0].message.content);
      
      return {
        matches: result.matches || result,
        tokenUsage: response.usage,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Smart matching error:', error);
      throw new Error(`Smart matching failed: ${error.message}`);
    }
  }

  // DYNAMIC PRICING: Calculate surge pricing with AI
  async calculateDynamicPricing(pricingContext) {
    try {
      const client = this.getClient();

      const prompt = `You are an AI dynamic pricing system for a rideshare platform. Calculate the optimal surge multiplier based on current conditions.

PRICING CONTEXT:
- Base Price: $${pricingContext.basePrice || 8.50}
- Current Demand Level: ${pricingContext.demandLevel || 'medium'} (low/medium/high/extreme)
- Weather: ${pricingContext.weather || 'clear'}
- Time of Day: ${pricingContext.timeOfDay || new Date().toLocaleTimeString()}
- Day of Week: ${pricingContext.dayOfWeek || new Date().toLocaleDateString('en-US', { weekday: 'long' })}
- Active Events: ${pricingContext.events || 'none'}
- Traffic Conditions: ${pricingContext.traffic || 'moderate'}
- Available Drivers: ${pricingContext.availableDrivers || 'unknown'}
- Pending Requests: ${pricingContext.pendingRequests || 'unknown'}

Calculate a fair surge multiplier (1.0 to 3.0) and provide detailed reasoning.

Return JSON with:
- surgeMultiplier: number between 1.0 and 3.0
- finalPrice: calculated final price
- confidence: confidence level 0-100
- breakdown: object with impact scores for each factor (demand, weather, events, traffic, time)
- reasoning: detailed explanation of the pricing decision
- recommendations: array of suggestions for drivers or passengers

Return ONLY valid JSON, no additional text.`;

      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert pricing algorithm. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4,
      });

      this.trackTokenUsage('dynamic_pricing', response.usage);

      const result = JSON.parse(response.choices[0].message.content);
      
      return {
        ...result,
        tokenUsage: response.usage,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Dynamic pricing error:', error);
      throw new Error(`Dynamic pricing failed: ${error.message}`);
    }
  }

  // ROUTE OPTIMIZATION: Analyze routes and recommend best option
  async optimizeRoute(routeOptions, userPreferences) {
    try {
      const client = this.getClient();

      const prompt = `You are an AI route optimization system. Analyze the following route options and recommend the best one based on user preferences.

ROUTE OPTIONS:
${JSON.stringify(routeOptions, null, 2)}

USER PREFERENCES:
${JSON.stringify(userPreferences, null, 2)}

Consider:
1. Total travel time
2. Distance
3. Traffic conditions
4. Fuel efficiency
5. Toll costs
6. Road quality
7. User preferences (fastest, cheapest, most scenic, etc.)

Return JSON with:
- recommendedRouteIndex: index of the best route (0-based)
- reasoning: detailed explanation of why this route is best
- comparison: array comparing all routes with scores
- estimatedSavings: time/cost savings vs other options
- warnings: any potential issues with the recommended route
- alternativeRoute: second-best option with brief explanation

Return ONLY valid JSON, no additional text.`;

      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert route optimization system. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      this.trackTokenUsage('route_optimization', response.usage);

      const result = JSON.parse(response.choices[0].message.content);
      
      return {
        ...result,
        tokenUsage: response.usage,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Route optimization error:', error);
      throw new Error(`Route optimization failed: ${error.message}`);
    }
  }

  // DEMAND PREDICTION: Predict ride demand for next 6 hours
  async predictDemand(demandContext) {
    try {
      const client = this.getClient();

      const currentTime = new Date();
      const prompt = `You are an AI demand forecasting system for a rideshare platform. Predict ride demand for the next 6 hours.

CURRENT CONTEXT:
- Current Time: ${currentTime.toLocaleString()}
- Day of Week: ${currentTime.toLocaleDateString('en-US', { weekday: 'long' })}
- Weather: ${demandContext.weather || 'clear'}
- Temperature: ${demandContext.temperature || 'moderate'}
- Local Events: ${demandContext.events || 'none'}
- Historical Pattern: ${demandContext.historicalPattern || 'typical weekday'}
- Current Demand: ${demandContext.currentDemand || 'medium'}
- Location: ${demandContext.location || 'city center'}

Predict demand for the next 6 hours in hourly intervals.

Return JSON with:
- predictions: array of 6 hourly predictions, each with:
  - hour: hour timestamp
  - demandLevel: predicted demand (low/medium/high/extreme)
  - demandScore: numerical score 0-100
  - confidence: confidence level 0-100
  - reasoning: brief explanation
- peakHours: array of predicted peak hours
- insights: array of actionable insights for operations
- recommendations: array of recommendations for driver deployment
- chartData: array formatted for chart display with labels and values

Return ONLY valid JSON, no additional text.`;

      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert demand forecasting system. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4,
      });

      this.trackTokenUsage('demand_prediction', response.usage);

      const result = JSON.parse(response.choices[0].message.content);
      
      return {
        ...result,
        tokenUsage: response.usage,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Demand prediction error:', error);
      throw new Error(`Demand prediction failed: ${error.message}`);
    }
  }

  // PREDICTIVE ANALYTICS: Comprehensive business analytics and forecasting
  async getPredictiveAnalytics(analyticsContext) {
    try {
      const client = this.getClient();

      const prompt = `You are an AI business analytics system for a rideshare platform. Analyze current metrics and historical data to provide comprehensive predictive analytics.

CURRENT METRICS:
${JSON.stringify(analyticsContext.currentMetrics || {}, null, 2)}

HISTORICAL DATA (last 30 days):
${JSON.stringify(analyticsContext.historicalData || {}, null, 2)}

Provide comprehensive analytics including:
1. Revenue forecasting (today, this week, this month)
2. Demand trends and patterns
3. Driver utilization optimization
4. Anomaly detection
5. Operational recommendations
6. Risk factors and opportunities

Return JSON with:
- revenueForecast: object with today, thisWeek, thisMonth predictions and confidence levels
- demandTrends: analysis of demand patterns with insights
- driverUtilization: current, predicted, and optimal utilization rates
- anomalies: array of detected anomalies with severity and recommendations
- insights: array of key business insights
- recommendations: array of prioritized actionable recommendations
- riskFactors: array of potential risks with mitigation strategies
- opportunities: array of growth opportunities
- kpis: key performance indicators with trends

Return ONLY valid JSON, no additional text.`;

      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert business analytics system. Always respond with valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5,
      });

      this.trackTokenUsage('predictive_analytics', response.usage);

      const result = JSON.parse(response.choices[0].message.content);
      
      return {
        ...result,
        tokenUsage: response.usage,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Predictive analytics error:', error);
      throw new Error(`Predictive analytics failed: ${error.message}`);
    }
  }

  // STREAMING CHAT: Stream responses for better UX
  async *streamChatCompletion(messages, options = {}) {
    try {
      const client = this.getClient();

      const stream = await client.chat.completions.create({
        model: options.model || 'gpt-4o',
        messages,
        stream: true,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      console.error('Streaming chat error:', error);
      throw new Error(`Streaming chat failed: ${error.message}`);
    }
  }
}

export default new OpenAIService();
