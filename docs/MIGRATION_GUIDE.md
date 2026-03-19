# Migration Guide: Mock AI → Real OpenAI Integration

This guide helps you migrate from mock AI implementations to real OpenAI-powered features.

## Overview

The new implementation maintains backward compatibility while adding real AI capabilities. Your existing code will continue to work, but you can now enable real AI features by simply adding API keys.

## What Changed

### Before (Mock Implementation)
```javascript
// aiService.js returned mock data
const result = await aiService.matchDriverPassenger(request);
// Always returned mock data
```

### After (Real AI with Fallback)
```javascript
// aiService.js now uses OpenAI when available
const result = await aiService.matchDriverPassenger(request);
// Returns real AI results if API key configured
// Falls back to mock data if not
```

## Migration Paths

### Path 1: No Changes Required (Automatic)

If you're already using `aiService.js`, you don't need to change anything:

```javascript
import aiService from './services/aiService';

// This code works exactly the same
const pricing = await aiService.calculateDynamicPrice(tripDetails);
const match = await aiService.matchDriverPassenger(request);
const route = await aiService.optimizeRoute(waypoints, preferences);
```

**What happens:**
1. If OpenAI API key is configured → Uses real AI
2. If not configured → Falls back to mock data
3. Your code doesn't need to know which is being used

### Path 2: Use New React Query Hooks (Recommended)

For better performance and UX, migrate to the new hooks:

#### Before
```javascript
import aiService from './services/aiService';

function MyComponent() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleMatch = async () => {
    setLoading(true);
    try {
      const result = await aiService.matchDriverPassenger(request);
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleMatch} disabled={loading}>
      Find Driver
    </button>
  );
}
```

#### After
```javascript
import { useSmartMatching } from './hooks/useAIFeatures';

function MyComponent() {
  const { mutate, data, isPending, error } = useSmartMatching();

  const handleMatch = () => {
    mutate({ drivers, passengerPreferences });
  };

  return (
    <button onClick={handleMatch} disabled={isPending}>
      Find Driver
    </button>
  );
}
```

**Benefits:**
- ✅ Automatic caching (5 min)
- ✅ Automatic retries
- ✅ Better error handling
- ✅ Loading states built-in
- ✅ Less boilerplate code

### Path 3: Direct OpenAI Service (Advanced)

For custom implementations, use the OpenAI service directly:

```javascript
import openAIService from './services/openAIService';

async function customAIFeature() {
  try {
    const result = await openAIService.matchDriverToPassenger(
      drivers,
      preferences
    );
    return result;
  } catch (error) {
    // Handle error or fallback to mock
    console.error('AI error:', error);
  }
}
```

## Feature-by-Feature Migration

### 1. Smart Driver Matching

#### Old Way
```javascript
const result = await aiService.matchDriverPassenger({
  location: { lat: 9.0054, lng: 38.7636 },
  vehicleType: 'sedan',
});
```

#### New Way (Hook)
```javascript
const { mutate, data } = useSmartMatching();

mutate({
  drivers: [
    { driverId: '001', driverName: 'John', rating: 4.8, distance: 2.5 }
  ],
  passengerPreferences: {
    vehicleType: 'sedan',
    maxWaitTime: 10,
  }
});
```

### 2. Dynamic Pricing

#### Old Way
```javascript
const pricing = await aiService.calculateDynamicPrice({
  distance: 10,
  duration: 20,
});
```

#### New Way (Hook)
```javascript
const { data, isLoading } = useDynamicPricing({
  basePrice: 8.50,
  demandLevel: 'high',
  weather: 'rainy',
  events: 'Concert at stadium',
});
```

### 3. Route Optimization

#### Old Way
```javascript
const route = await aiService.optimizeRoute(
  [origin, destination],
  { prioritizeTime: true }
);
```

#### New Way (Hook)
```javascript
const { optimizeRoute, isOptimizing } = useRouteOptimization();

const result = await optimizeRoute(
  { lng: 38.7636, lat: 9.0054 },
  { lng: 38.7969, lat: 9.0320 },
  { prioritize: 'time' }
);
```

**Note:** Now uses real Mapbox routes + AI analysis!

### 4. Demand Prediction

#### Old Way
```javascript
const demand = await aiService.predictDemand(
  { lat: 9.0054, lng: 38.7636 },
  '6h'
);
```

#### New Way (Hook)
```javascript
const { data, isLoading } = useDemandPrediction({
  location: 'Downtown',
  weather: 'clear',
  events: 'Weekend market',
  currentDemand: 'medium',
});
```

### 5. Predictive Analytics

#### Old Way
```javascript
const analytics = await aiService.getPredictiveAnalytics('24h');
```

#### New Way (Hook)
```javascript
const { data, isLoading } = usePredictiveAnalytics({
  currentMetrics: {
    activeRides: 75,
    availableDrivers: 45,
    averageWaitTime: 5,
    currentRevenue: 15000,
  },
});
```

## Adding Token Usage Tracking

### Simple Display
```javascript
import { useTokenUsage } from './hooks/useAIFeatures';

function MyComponent() {
  const { usage } = useTokenUsage();
  
  return (
    <div>
      Tokens used: {usage.total}
    </div>
  );
}
```

### Full Tracker Component
```javascript
import TokenUsageTracker from './components/ai/TokenUsageTracker';

function MyApp() {
  return (
    <div>
      <TokenUsageTracker compact />
      {/* Your app content */}
    </div>
  );
}
```

## Configuration Migration

### Before (Environment Variables Only)
```bash
# .env
VITE_AI_API_URL=http://localhost:8001/api/ai
```

### After (Multiple Options)

**Option 1: Environment Variables**
```bash
# .env
VITE_OPENAI_API_KEY=sk-...
VITE_MAPBOX_TOKEN=pk....
```

**Option 2: Runtime Config**
```javascript
// public/config.js
window.APP_CONFIG = {
  openAIApiKey: 'sk-...',
  mapboxToken: 'pk....',
};
```

**Option 3: In-App Settings**
- Users configure keys through settings UI
- Keys stored in sessionStorage
- No rebuild required

## Error Handling Migration

### Before
```javascript
try {
  const result = await aiService.matchDriverPassenger(request);
} catch (error) {
  console.error('Error:', error);
  // Show error to user
}
```

### After (with Hook)
```javascript
const { mutate, error, isError } = useSmartMatching({
  onError: (error) => {
    console.error('Error:', error);
    // Show error to user
  },
  onSuccess: (data) => {
    console.log('Success:', data);
  },
});

// In JSX
{isError && <Alert severity="error">{error.message}</Alert>}
```

## Testing Migration

### Before
```javascript
// Mock aiService in tests
jest.mock('./services/aiService', () => ({
  matchDriverPassenger: jest.fn().mockResolvedValue(mockData),
}));
```

### After
```javascript
// Mock OpenAI service
jest.mock('./services/openAIService', () => ({
  matchDriverToPassenger: jest.fn().mockResolvedValue(mockData),
}));

// Or mock the hook
jest.mock('./hooks/useAIFeatures', () => ({
  useSmartMatching: () => ({
    mutate: jest.fn(),
    data: mockData,
    isPending: false,
  }),
}));
```

## Performance Considerations

### Caching
The new implementation includes automatic caching:

```javascript
// First call - hits API
const { data } = useDynamicPricing(context);

// Within 5 minutes - uses cache
const { data: cachedData } = useDynamicPricing(context);
```

### Invalidation
Manually invalidate cache when needed:

```javascript
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Invalidate specific query
queryClient.invalidateQueries({ queryKey: ['dynamic-pricing'] });

// Invalidate all AI queries
queryClient.invalidateQueries({ queryKey: ['dynamic-pricing'] });
queryClient.invalidateQueries({ queryKey: ['demand-prediction'] });
```

## Cost Management

### Monitor Usage
```javascript
import { useTokenUsage } from './hooks/useAIFeatures';

const { usage, resetUsage } = useTokenUsage();

console.log('Total tokens:', usage.total);
console.log('By feature:', usage.byFeature);

// Reset at start of billing period
resetUsage();
```

### Optimize Calls
```javascript
// Bad: Calling on every render
function BadComponent() {
  const { data } = useDynamicPricing(context); // Called repeatedly
  return <div>{data}</div>;
}

// Good: Call only when needed
function GoodComponent() {
  const { data, refetch } = useDynamicPricing(context, {
    enabled: false, // Don't auto-fetch
  });
  
  return (
    <button onClick={() => refetch()}>
      Calculate Price
    </button>
  );
}
```

## Rollback Plan

If you need to rollback to mock data:

### Option 1: Remove API Keys
Simply remove or clear the API keys - the system automatically falls back to mock data.

### Option 2: Environment Variable
```bash
# .env
VITE_USE_OPENAI=false
```

### Option 3: Code Change
```javascript
// In aiService.js
const USE_OPENAI = false; // Force disable OpenAI
```

## Common Issues & Solutions

### Issue: "API key not configured"
**Solution:** Add API key via settings, .env, or config.js

### Issue: High token usage
**Solution:** 
- Increase cache time
- Reduce API call frequency
- Use `enabled: false` and manual refetch

### Issue: Rate limiting
**Solution:**
- Upgrade OpenAI plan
- Implement request queuing
- Increase retry delays

### Issue: Slow responses
**Solution:**
- Use streaming for chat features
- Show loading states
- Implement optimistic updates

## Checklist

- [ ] Review current aiService usage
- [ ] Decide on migration path (automatic, hooks, or direct)
- [ ] Add API keys configuration
- [ ] Test with demo page
- [ ] Migrate components one by one
- [ ] Add token usage monitoring
- [ ] Update tests
- [ ] Monitor costs
- [ ] Document for team

## Support

- Check [OPENAI_INTEGRATION.md](./OPENAI_INTEGRATION.md) for detailed docs
- See [QUICKSTART_AI.md](./QUICKSTART_AI.md) for quick setup
- Review [AI_IMPLEMENTATION_SUMMARY.md](./AI_IMPLEMENTATION_SUMMARY.md) for overview
- Test with demo page at `/ai-demo`

## Summary

The migration is designed to be seamless:
1. **No changes required** - existing code works with automatic fallback
2. **Opt-in improvements** - use new hooks for better UX
3. **Backward compatible** - all existing APIs maintained
4. **Gradual migration** - migrate features one at a time
5. **Easy rollback** - remove API keys to revert to mock data

Start with the demo page, then migrate your components gradually using the new hooks for the best experience.
