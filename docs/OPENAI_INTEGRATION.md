# OpenAI Integration Guide

This document explains how the OpenAI API is integrated into the rideshare platform to power real AI features.

## Overview

All mock AI implementations have been replaced with real OpenAI API calls using GPT-4o. The integration runs directly from the browser using the user's API key stored securely in Zustand state.

## Features Implemented

### 1. Smart Driver Matching
**File:** `src/services/openAIService.js` - `matchDriverToPassenger()`

Analyzes available drivers and passenger preferences to recommend the best matches.

**Input:**
- List of drivers (name, rating, distance, vehicle type, location)
- Passenger preferences (vehicle type, max wait time, preferred rating)

**Output:**
- Ranked array of driver matches
- Match scores (0-100) with detailed reasoning
- Individual scores for proximity, rating, vehicle match, ETA, availability

**Usage:**
```javascript
import { useSmartMatching } from './hooks/useAIFeatures';

const { mutate, data, isPending } = useSmartMatching();

mutate({
  drivers: [...],
  passengerPreferences: { vehicleType: 'sedan', maxWaitTime: 10 }
});
```

### 2. Dynamic Pricing
**File:** `src/services/openAIService.js` - `calculateDynamicPricing()`

Calculates optimal surge pricing based on real-time conditions.

**Input:**
- Base price
- Demand level (low/medium/high/extreme)
- Weather conditions
- Time of day and day of week
- Active events
- Traffic conditions
- Available drivers and pending requests

**Output:**
- Surge multiplier (1.0 - 3.0)
- Final calculated price
- Confidence level (0-100)
- Breakdown of impact factors
- Detailed reasoning
- Recommendations for drivers/passengers

**Usage:**
```javascript
import { useDynamicPricing } from './hooks/useAIFeatures';

const { data, isLoading } = useDynamicPricing({
  basePrice: 8.50,
  demandLevel: 'high',
  weather: 'rainy',
  events: 'Concert at stadium'
});
```

### 3. Route Optimization
**File:** `src/services/openAIService.js` - `optimizeRoute()`
**File:** `src/services/mapboxService.js` - `getRouteWithTraffic()`

Combines Mapbox Directions API with OpenAI analysis for intelligent route recommendations.

**Process:**
1. Fetch real routes from Mapbox Directions API (with traffic data)
2. Pass route options to GPT-4o for analysis
3. AI recommends best route based on time, distance, traffic, fuel efficiency, and user preferences

**Input:**
- Origin and destination coordinates
- User preferences (fastest, cheapest, most scenic, etc.)

**Output:**
- Recommended route with reasoning
- Comparison of all available routes
- Estimated savings vs alternatives
- Warnings about potential issues
- Alternative route suggestion

**Usage:**
```javascript
import { useRouteOptimization } from './hooks/useAIFeatures';

const { optimizeRoute, isOptimizing } = useRouteOptimization();

const result = await optimizeRoute(
  { lng: 38.7636, lat: 9.0054 },
  { lng: 38.7969, lat: 9.0320 },
  { prioritize: 'time', avoidTolls: false }
);
```

### 4. Demand Prediction
**File:** `src/services/openAIService.js` - `predictDemand()`

Predicts ride demand for the next 6 hours using AI analysis.

**Input:**
- Current time and day of week
- Weather and temperature
- Local events
- Historical patterns
- Current demand level
- Location

**Output:**
- 6 hourly predictions with demand levels and scores
- Confidence levels for each prediction
- Peak hours identification
- Actionable insights for operations
- Recommendations for driver deployment
- Chart-ready data format

**Usage:**
```javascript
import { useDemandPrediction } from './hooks/useAIFeatures';

const { data, isLoading } = useDemandPrediction({
  location: 'Downtown',
  weather: 'clear',
  events: 'Weekend market',
  currentDemand: 'medium'
});
```

### 5. Predictive Analytics
**File:** `src/services/openAIService.js` - `getPredictiveAnalytics()`

Comprehensive business analytics and forecasting.

**Input:**
- Current metrics (active rides, available drivers, wait times, revenue)
- Historical data (last 30 days revenue, rides, patterns)

**Output:**
- Revenue forecasts (today, this week, this month) with confidence
- Demand trends and pattern analysis
- Driver utilization (current, predicted, optimal)
- Anomaly detection with severity levels
- Key business insights
- Prioritized actionable recommendations
- Risk factors with mitigation strategies
- Growth opportunities
- KPI trends

**Usage:**
```javascript
import { usePredictiveAnalytics } from './hooks/useAIFeatures';

const { data, isLoading } = usePredictiveAnalytics({
  currentMetrics: {
    activeRides: 75,
    availableDrivers: 45,
    averageWaitTime: 5,
    currentRevenue: 15000
  },
  historicalData: { ... }
});
```

## Architecture

### Services Layer

**`src/services/openAIService.js`**
- Manages OpenAI client initialization
- Implements all AI features
- Tracks token usage per feature
- Handles errors and retries

**`src/services/mapboxService.js`**
- Fetches real routes from Mapbox Directions API
- Provides geocoding and reverse geocoding
- Supports isochrone and distance matrix calculations

**`src/services/aiService.js`**
- Main AI service facade
- Automatically uses OpenAI when API key is available
- Falls back to ML models or mock data if OpenAI unavailable
- Maintains backward compatibility

### React Query Hooks

**`src/hooks/useAIFeatures.js`**

All hooks include:
- Automatic caching (5 min stale time)
- Loading states
- Error handling
- Retry logic (2 retries with exponential backoff)
- Token usage tracking

Available hooks:
- `useSmartMatching()` - Mutation hook for driver matching
- `useDynamicPricing()` - Query hook with auto-caching
- `useRouteOptimization()` - Custom hook combining Mapbox + OpenAI
- `useDemandPrediction()` - Query hook with 5 min cache
- `usePredictiveAnalytics()` - Query hook with 5 min cache
- `useTokenUsage()` - Track and manage token consumption
- `useStreamingChat()` - Streaming responses for chat
- `useMapboxDirections()` - Mutation hook for Mapbox routes
- `useGeocoding()` - Geocoding and reverse geocoding
- `useAIServiceStatus()` - Check service availability

### State Management

**`src/stores/apiKeyStore.js`**
- Stores API keys in sessionStorage (not localStorage for security)
- Keys don't persist across browser sessions
- Supports runtime configuration via `window.APP_CONFIG`
- Validation status tracking
- Setup completion tracking

## Configuration

### Option 1: Environment Variables (Build-time)

Add to `.env`:
```bash
VITE_OPENAI_API_KEY=sk-...
VITE_MAPBOX_TOKEN=pk....
```

### Option 2: Runtime Configuration (Recommended)

Add to `public/config.js`:
```javascript
window.APP_CONFIG = {
  openAIApiKey: 'sk-...',
  mapboxToken: 'pk....'
};
```

### Option 3: In-App Setup (Best for Users)

Users can configure API keys through the in-app settings modal:
1. Click "Settings" or "API Keys"
2. Enter OpenAI API key
3. Enter Mapbox access token
4. Keys are validated and stored in sessionStorage

## Token Usage Tracking

All OpenAI calls track token usage:

```javascript
import { useTokenUsage } from './hooks/useAIFeatures';

const { usage, refreshUsage, resetUsage } = useTokenUsage();

console.log(usage.total); // Total tokens used
console.log(usage.byFeature); // Breakdown by feature
```

**Token Usage Component:**
```jsx
import TokenUsageTracker from './components/ai/TokenUsageTracker';

<TokenUsageTracker /> // Full display
<TokenUsageTracker compact /> // Compact chip display
```

## Demo Component

**`src/components/ai/AIFeaturesDemo.jsx`**

Interactive demo showcasing all AI features:
- Tabbed interface for each feature
- Live token usage tracking
- Error handling and loading states
- Real-time results display

## Security Considerations

1. **Browser-side API calls**: OpenAI client runs in browser with `dangerouslyAllowBrowser: true`
   - Required for client-side usage
   - API keys stored in sessionStorage (cleared on browser close)
   - Never committed to version control

2. **API Key Storage**:
   - sessionStorage (not localStorage) - doesn't persist across sessions
   - Not included in build artifacts
   - User-provided keys only

3. **Rate Limiting**:
   - TanStack Query caching reduces API calls
   - 5-minute stale time prevents excessive requests
   - Debouncing on user inputs

4. **Error Handling**:
   - Graceful fallbacks to mock data
   - Retry logic with exponential backoff
   - User-friendly error messages

## Cost Optimization

1. **Caching**: 5-minute stale time reduces redundant calls
2. **Structured Prompts**: Optimized for minimal token usage
3. **JSON Mode**: `response_format: json_object` ensures clean responses
4. **Temperature Settings**: Lower temperatures (0.3-0.5) for consistent, concise outputs
5. **Token Tracking**: Real-time monitoring helps users manage costs

## Testing

### Test with Demo Component

```jsx
import AIFeaturesDemo from './components/ai/AIFeaturesDemo';

function App() {
  return <AIFeaturesDemo />;
}
```

### Test Individual Features

```javascript
// Smart Matching
const { mutate } = useSmartMatching();
mutate({ drivers: [...], passengerPreferences: {...} });

// Dynamic Pricing
const { data } = useDynamicPricing({ basePrice: 8.50, demandLevel: 'high' });

// Route Optimization
const { optimizeRoute } = useRouteOptimization();
const result = await optimizeRoute(origin, destination, preferences);
```

## API Keys

### OpenAI API Key
- Get from: https://platform.openai.com/api-keys
- Model used: GPT-4o
- Pricing: ~$0.005 per 1K tokens (input) + $0.015 per 1K tokens (output)

### Mapbox Access Token
- Get from: https://account.mapbox.com/access-tokens/
- Free tier: 50,000 map loads/month
- Directions API: 100,000 requests/month free

## Troubleshooting

### "OpenAI API key not configured"
- Ensure API key is set in settings or environment variables
- Check that key starts with `sk-`
- Verify key is not the placeholder value

### "Mapbox access token not configured"
- Ensure token is set in settings or environment variables
- Check that token starts with `pk.`
- Verify token has Directions API scope enabled

### High token usage
- Check token usage tracker
- Review caching configuration
- Consider increasing stale time
- Optimize prompts if needed

### Rate limiting errors
- OpenAI has rate limits based on your plan
- Implement request queuing if needed
- Consider upgrading OpenAI plan

## Future Enhancements

1. **Streaming Responses**: Already implemented for chat, can extend to other features
2. **Function Calling**: Use OpenAI function calling for structured outputs
3. **Fine-tuning**: Train custom models on rideshare-specific data
4. **Embeddings**: Use for semantic search and similarity matching
5. **Vision API**: Analyze driver/vehicle photos for verification
6. **Whisper API**: Voice commands and transcription
7. **Backend Proxy**: Move API calls to backend for better security and rate limiting

## Support

For issues or questions:
1. Check this documentation
2. Review error messages in browser console
3. Verify API keys are valid
4. Check token usage and rate limits
5. Test with demo component first
