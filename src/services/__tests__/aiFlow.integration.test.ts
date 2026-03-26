/**
 * AI Flow Integration Test
 *
 * Tests the full request path:
 *   component hook → openAIService._chat() → fetch (mocked) → parsed result
 *
 * No real network calls are made. fetch is replaced with jest.spyOn so the
 * actual service code (JSON building, error handling, token tracking) runs.
 */

import openAIService from '../openAIService';
import googleAIService from '../googleAIService';

// ── helpers ──────────────────────────────────────────────────────────────────

function mockFetchOnce(body: unknown, status = 200) {
  const response = new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
  jest.spyOn(global, 'fetch').mockResolvedValueOnce(response);
}

function mockFetchError(message: string) {
  jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error(message));
}

// ── setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.restoreAllMocks();
  openAIService.resetTokenUsage();
});

// ── Smart Matching ────────────────────────────────────────────────────────────

describe('OpenAI smart matching flow', () => {
  const drivers = [
    { driverId: 'drv-1', driverName: 'Alice', rating: 4.9, distance: 1.2, vehicleType: 'sedan', vehicle: 'Toyota Camry', location: { lat: 9.005, lng: 38.763 }, availability: 'available' },
    { driverId: 'drv-2', driverName: 'Bob',   rating: 4.7, distance: 2.5, vehicleType: 'suv',   vehicle: 'Honda CR-V',   location: { lat: 9.010, lng: 38.770 }, availability: 'available' },
  ];

  const preferences = { vehicleType: 'sedan', maxWaitTime: 10, preferredRating: 4.5, location: { lat: 9.005, lng: 38.763 } };

  it('parses a successful match response and tracks token usage', async () => {
    const apiPayload = {
      choices: [{ message: { content: JSON.stringify({ matches: [{ driverId: 'drv-1', driverName: 'Alice', matchScore: 96, reasoning: 'Closest', scores: { proximity: 95, rating: 98, vehicleMatch: 100, eta: 90, availability: 95 }, estimatedArrival: 3, vehicle: 'Toyota Camry' }] }) } }],
      usage: { prompt_tokens: 120, completion_tokens: 80, total_tokens: 200 },
    };

    mockFetchOnce(apiPayload);

    const result = await openAIService.matchDriverToPassenger(drivers, preferences);

    expect(result.matches).toHaveLength(1);
    expect((result.matches[0] as { driverName: string }).driverName).toBe('Alice');
    expect(result.tokenUsage.total_tokens).toBe(200);

    // Token usage should be tracked
    const usage = openAIService.getTokenUsage();
    expect(usage.total).toBe(200);
    expect(usage.byFeature['smart_matching']).toBe(200);
  });

  it('throws when the proxy returns a non-OK status', async () => {
    mockFetchOnce({ error: 'Unauthorized' }, 401);
    await expect(openAIService.matchDriverToPassenger(drivers, preferences)).rejects.toThrow('Unauthorized');
  });

  it('throws when fetch itself fails (network error)', async () => {
    mockFetchError('Network failure');
    await expect(openAIService.matchDriverToPassenger(drivers, preferences)).rejects.toThrow('Network failure');
  });
});

// ── Dynamic Pricing ───────────────────────────────────────────────────────────

describe('OpenAI dynamic pricing flow', () => {
  const pricingCtx = { basePrice: 8.5, demandLevel: 'high', weather: 'rain', timeOfDay: '18:00', dayOfWeek: 'Friday', events: 'concert', traffic: 'heavy', availableDrivers: 12, pendingRequests: 45 };

  it('returns surge multiplier and tracks tokens', async () => {
    const apiPayload = {
      choices: [{ message: { content: JSON.stringify({ surgeMultiplier: 1.8, finalPrice: 15.3, confidence: 87, breakdown: {}, reasoning: 'High demand Friday evening', recommendations: ['Add drivers near stadium'] }) } }],
      usage: { prompt_tokens: 150, completion_tokens: 60, total_tokens: 210 },
    };

    mockFetchOnce(apiPayload);

    const result = await openAIService.calculateDynamicPricing(pricingCtx);

    expect(result.surgeMultiplier).toBe(1.8);
    expect(result.finalPrice).toBe(15.3);
    expect(result.tokenUsage.total_tokens).toBe(210);
    expect(openAIService.getTokenUsage().byFeature['dynamic_pricing']).toBe(210);
  });
});

// ── Demand Prediction ─────────────────────────────────────────────────────────

describe('OpenAI demand prediction flow', () => {
  it('returns hourly predictions', async () => {
    const predictions = Array.from({ length: 6 }, (_, i) => ({ hour: 14 + i, demand: 60 + i * 5, confidence: 0.85 }));
    const apiPayload = {
      choices: [{ message: { content: JSON.stringify({ predictions, peakHours: [17, 18], insights: ['Rush hour peak'], recommendations: ['Deploy more drivers'], chartData: {} }) } }],
      usage: { prompt_tokens: 100, completion_tokens: 90, total_tokens: 190 },
    };

    mockFetchOnce(apiPayload);

    const result = await openAIService.predictDemand({ location: 'Bole', timeRange: '6h' });

    expect(result.predictions).toHaveLength(6);
    expect(result.peakHours).toContain(17);
    expect(result.tokenUsage.total_tokens).toBe(190);
  });
});

// ── Google AI Chat ────────────────────────────────────────────────────────────

describe('Google AI chat flow', () => {
  it('sends message and stores conversation history', async () => {
    mockFetchOnce({ text: 'Hello! I can help you book a ride.' });

    const result = await googleAIService.sendChatMessage('Hi there', 'conv-test-1');

    expect(result.response).toBe('Hello! I can help you book a ride.');
    expect(result.model).toContain('gemini');
    expect(Array.isArray(result.suggestions)).toBe(true);
  });

  it('falls back to mock response when proxy fails', async () => {
    mockFetchError('Proxy unavailable');

    const result = await googleAIService.sendChatMessage('book a ride', 'conv-test-2');

    // getMockResponse is called internally on error — should still return a valid shape
    expect(result.response).toBeTruthy();
    expect(result.model).toBe('mock');
  });

  it('generates contextual suggestions based on message content', () => {
    const suggestions = googleAIService.generateSuggestions('I want to book a ride', 'Sure, where to?');
    expect(suggestions.some(s => /book|ride|fare|schedule/i.test(s))).toBe(true);
  });
});

// ── Token budget guard ────────────────────────────────────────────────────────

describe('Token usage accumulation', () => {
  it('accumulates tokens across multiple calls', async () => {
    const makePayload = (tokens: number) => ({
      choices: [{ message: { content: JSON.stringify({ surgeMultiplier: 1.2, finalPrice: 10, confidence: 80, breakdown: {}, reasoning: '', recommendations: [] }) } }],
      usage: { prompt_tokens: tokens / 2, completion_tokens: tokens / 2, total_tokens: tokens },
    });

    mockFetchOnce(makePayload(100));
    mockFetchOnce(makePayload(150));

    await openAIService.calculateDynamicPricing({ basePrice: 8.5 });
    await openAIService.calculateDynamicPricing({ basePrice: 8.5 });

    expect(openAIService.getTokenUsage().total).toBe(250);
    expect(openAIService.getTokenUsage().byFeature['dynamic_pricing']).toBe(250);
  });

  it('resets token usage correctly', async () => {
    const payload = {
      choices: [{ message: { content: JSON.stringify({ surgeMultiplier: 1.0, finalPrice: 8.5, confidence: 90, breakdown: {}, reasoning: '', recommendations: [] }) } }],
      usage: { total_tokens: 50 },
    };
    mockFetchOnce(payload);
    await openAIService.calculateDynamicPricing({});

    openAIService.resetTokenUsage();
    expect(openAIService.getTokenUsage().total).toBe(0);
  });
});
