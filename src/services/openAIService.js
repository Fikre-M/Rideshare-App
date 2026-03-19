/**
 * OpenAI Service — routes all requests through the server-side proxy.
 * API keys never touch the browser.
 */
import aiBudgetGuard from './aiBudgetGuard';

const PROXY_BASE = import.meta.env.VITE_AI_PROXY_URL || '/api/ai';

class OpenAIService {
  constructor() {
    this.tokenUsage = { total: 0, byFeature: {} };
    this.budgetGuard = aiBudgetGuard;
  }

  // ── Budget helpers ──────────────────────────────────────────────────────────
  canMakeRequest() {
    return this.budgetGuard.canMakeRequest();
  }

  trackTokenUsage(feature, usage) {
    if (!usage) return;
    const tokens = usage.total_tokens || 0;
    this.tokenUsage.total += tokens;
    this.tokenUsage.byFeature[feature] = (this.tokenUsage.byFeature[feature] || 0) + tokens;
    this.budgetGuard.trackUsage(feature, usage);
  }

  getTokenUsage() {
    return { ...this.tokenUsage };
  }

  resetTokenUsage() {
    this.tokenUsage = { total: 0, byFeature: {} };
  }

  // ── Core proxy call ─────────────────────────────────────────────────────────
  async _chat(payload) {
    if (!this.canMakeRequest()) {
      throw new Error('AI budget limit exceeded. Please reset or increase your budget limit.');
    }

    const res = await fetch(`${PROXY_BASE}/openai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `Proxy error ${res.status}`);
    }

    return res.json();
  }

  // ── Smart Matching ──────────────────────────────────────────────────────────
  async matchDriverToPassenger(drivers, passengerPreferences) {
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
- driverId, driverName, matchScore (0-100), reasoning, scores (proximity/rating/vehicleMatch/eta/availability each 0-100), estimatedArrival, vehicle

Return ONLY valid JSON, no additional text.`;

    const completion = await this._chat({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert rideshare matching algorithm. Always respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    this.trackTokenUsage('smart_matching', completion.usage);
    const result = JSON.parse(completion.choices[0].message.content);
    return { matches: result.matches || result, tokenUsage: completion.usage, timestamp: new Date().toISOString() };
  }

  // ── Dynamic Pricing ─────────────────────────────────────────────────────────
  async calculateDynamicPricing(pricingContext) {
    const prompt = `You are an AI dynamic pricing system for a rideshare platform. Calculate the optimal surge multiplier based on current conditions.

PRICING CONTEXT:
- Base Price: ${pricingContext.basePrice || 8.50}
- Current Demand Level: ${pricingContext.demandLevel || 'medium'}
- Weather: ${pricingContext.weather || 'clear'}
- Time of Day: ${pricingContext.timeOfDay || new Date().toLocaleTimeString()}
- Day of Week: ${pricingContext.dayOfWeek || new Date().toLocaleDateString('en-US', { weekday: 'long' })}
- Active Events: ${pricingContext.events || 'none'}
- Traffic Conditions: ${pricingContext.traffic || 'moderate'}
- Available Drivers: ${pricingContext.availableDrivers || 'unknown'}
- Pending Requests: ${pricingContext.pendingRequests || 'unknown'}

Return JSON with: surgeMultiplier (1.0-3.0), finalPrice, confidence (0-100), breakdown, reasoning, recommendations.
Return ONLY valid JSON.`;

    const completion = await this._chat({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert pricing algorithm. Always respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
    });

    this.trackTokenUsage('dynamic_pricing', completion.usage);
    const result = JSON.parse(completion.choices[0].message.content);
    return { ...result, tokenUsage: completion.usage, timestamp: new Date().toISOString() };
  }

  // ── Route Optimization ──────────────────────────────────────────────────────
  async optimizeRoute(routeOptions, userPreferences) {
    const prompt = `You are an AI route optimization system. Analyze the following route options and recommend the best one.

ROUTE OPTIONS:
${JSON.stringify(routeOptions, null, 2)}

USER PREFERENCES:
${JSON.stringify(userPreferences, null, 2)}

Return JSON with: recommendedRouteIndex, reasoning, comparison, estimatedSavings, warnings, alternativeRoute.
Return ONLY valid JSON.`;

    const completion = await this._chat({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert route optimization system. Always respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    this.trackTokenUsage('route_optimization', completion.usage);
    const result = JSON.parse(completion.choices[0].message.content);
    return { ...result, tokenUsage: completion.usage, timestamp: new Date().toISOString() };
  }

  // ── Demand Prediction ───────────────────────────────────────────────────────
  async predictDemand(demandContext) {
    const currentTime = new Date();
    const prompt = `You are an AI demand forecasting system. Predict ride demand for the next 6 hours.

CURRENT CONTEXT:
- Current Time: ${currentTime.toLocaleString()}
- Day of Week: ${currentTime.toLocaleDateString('en-US', { weekday: 'long' })}
- Weather: ${demandContext.weather || 'clear'}
- Temperature: ${demandContext.temperature || 'moderate'}
- Local Events: ${demandContext.events || 'none'}
- Historical Pattern: ${demandContext.historicalPattern || 'typical weekday'}
- Current Demand: ${demandContext.currentDemand || 'medium'}
- Location: ${demandContext.location || 'city center'}

Return JSON with: predictions (array of 6 hourly items), peakHours, insights, recommendations, chartData.
Return ONLY valid JSON.`;

    const completion = await this._chat({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert demand forecasting system. Always respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
    });

    this.trackTokenUsage('demand_prediction', completion.usage);
    const result = JSON.parse(completion.choices[0].message.content);
    return { ...result, tokenUsage: completion.usage, timestamp: new Date().toISOString() };
  }

  // ── Predictive Analytics ────────────────────────────────────────────────────
  async getPredictiveAnalytics(analyticsContext) {
    const prompt = `You are an AI business analytics system for a rideshare platform.

CURRENT METRICS:
${JSON.stringify(analyticsContext.currentMetrics || {}, null, 2)}

HISTORICAL DATA (last 30 days):
${JSON.stringify(analyticsContext.historicalData || {}, null, 2)}

Return JSON with: revenueForecast, demandTrends, driverUtilization, anomalies, insights, recommendations, riskFactors, opportunities, kpis.
Return ONLY valid JSON.`;

    const completion = await this._chat({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert business analytics system. Always respond with valid JSON only.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    });

    this.trackTokenUsage('predictive_analytics', completion.usage);
    const result = JSON.parse(completion.choices[0].message.content);
    return { ...result, tokenUsage: completion.usage, timestamp: new Date().toISOString() };
  }

  // ── Streaming Chat ──────────────────────────────────────────────────────────
  async *streamChatCompletion(messages, options = {}) {
    if (!this.canMakeRequest()) {
      throw new Error('AI budget limit exceeded. Please reset or increase your budget limit.');
    }

    const res = await fetch(`${PROXY_BASE}/openai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options.model || 'gpt-4o',
        messages,
        stream: true,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 1000,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `Proxy error ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value).split('\n').filter(Boolean);
      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const { content } = JSON.parse(line.slice(6));
            if (content) yield content;
          } catch {
            // skip malformed chunks
          }
        }
      }
    }
  }
}

export default new OpenAIService();
