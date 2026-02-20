# Quick Start: AI Features

Get started with real OpenAI-powered AI features in 5 minutes.

## Prerequisites

1. **OpenAI API Key** (required for AI features)
   - Sign up at https://platform.openai.com/
   - Create an API key at https://platform.openai.com/api-keys
   - Starts with `sk-`

2. **Mapbox Access Token** (required for route optimization)
   - Sign up at https://www.mapbox.com/
   - Create a token at https://account.mapbox.com/access-tokens/
   - Starts with `pk.`

## Setup Methods

### Method 1: In-App Configuration (Recommended)

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open the app in your browser

3. Navigate to Settings or API Keys section

4. Enter your API keys:
   - OpenAI API Key: `sk-...`
   - Mapbox Access Token: `pk....`

5. Keys are validated and stored in sessionStorage

6. Navigate to AI Demo page to test features

### Method 2: Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your keys:
   ```bash
   VITE_OPENAI_API_KEY=sk-your-actual-key-here
   VITE_MAPBOX_TOKEN=pk.your-actual-token-here
   ```

3. Restart the dev server:
   ```bash
   npm run dev
   ```

### Method 3: Runtime Configuration

1. Edit `public/config.js`:
   ```javascript
   window.APP_CONFIG = {
     openAIApiKey: 'sk-your-actual-key-here',
     mapboxToken: 'pk.your-actual-token-here'
   };
   ```

2. Restart the dev server

## Test the Integration

### Option 1: Use the Demo Page

1. Navigate to `/ai-demo` in your app
2. Try each feature tab:
   - Smart Matching
   - Dynamic Pricing
   - Route Optimization
   - Demand Prediction
   - Predictive Analytics
3. Monitor token usage in real-time

### Option 2: Use in Your Code

```javascript
import { useSmartMatching } from './hooks/useAIFeatures';

function MyComponent() {
  const { mutate, data, isPending } = useSmartMatching();

  const handleMatch = () => {
    mutate({
      drivers: [
        {
          driverId: 'driver_001',
          driverName: 'John Smith',
          rating: 4.8,
          distance: 2.5,
          vehicleType: 'sedan',
        }
      ],
      passengerPreferences: {
        vehicleType: 'sedan',
        maxWaitTime: 10,
      }
    });
  };

  return (
    <button onClick={handleMatch} disabled={isPending}>
      Find Driver
    </button>
  );
}
```

## Available Features

### 1. Smart Driver Matching
```javascript
import { useSmartMatching } from './hooks/useAIFeatures';

const { mutate, data } = useSmartMatching();
mutate({ drivers, passengerPreferences });
```

### 2. Dynamic Pricing
```javascript
import { useDynamicPricing } from './hooks/useAIFeatures';

const { data, isLoading } = useDynamicPricing({
  basePrice: 8.50,
  demandLevel: 'high',
  weather: 'rainy',
});
```

### 3. Route Optimization
```javascript
import { useRouteOptimization } from './hooks/useAIFeatures';

const { optimizeRoute, isOptimizing } = useRouteOptimization();
const result = await optimizeRoute(origin, destination, preferences);
```

### 4. Demand Prediction
```javascript
import { useDemandPrediction } from './hooks/useAIFeatures';

const { data } = useDemandPrediction({
  location: 'Downtown',
  weather: 'clear',
});
```

### 5. Predictive Analytics
```javascript
import { usePredictiveAnalytics } from './hooks/useAIFeatures';

const { data } = usePredictiveAnalytics({
  currentMetrics: { activeRides: 75, availableDrivers: 45 }
});
```

## Monitor Token Usage

```javascript
import { useTokenUsage } from './hooks/useAIFeatures';

const { usage, refreshUsage, resetUsage } = useTokenUsage();

console.log(`Total tokens: ${usage.total}`);
console.log(`By feature:`, usage.byFeature);
```

Or use the component:
```jsx
import TokenUsageTracker from './components/ai/TokenUsageTracker';

<TokenUsageTracker /> // Full display
<TokenUsageTracker compact /> // Compact display
```

## Cost Estimation

Approximate costs (GPT-4o pricing):
- Smart Matching: ~500-1000 tokens per request (~$0.01)
- Dynamic Pricing: ~300-600 tokens per request (~$0.005)
- Route Optimization: ~400-800 tokens per request (~$0.008)
- Demand Prediction: ~600-1200 tokens per request (~$0.012)
- Predictive Analytics: ~800-1500 tokens per request (~$0.015)

**Note:** Actual costs vary based on input size and response length.

## Caching & Optimization

All features include:
- **5-minute cache**: Repeated requests use cached data
- **Automatic retries**: 2 retries with exponential backoff
- **Error handling**: Graceful fallbacks to mock data
- **Loading states**: Built-in loading indicators

## Troubleshooting

### "API key not configured"
- Check that your API key is properly set
- Verify it starts with `sk-` for OpenAI or `pk.` for Mapbox
- Try re-entering the key in settings

### "Rate limit exceeded"
- You've hit OpenAI's rate limit
- Wait a few minutes and try again
- Consider upgrading your OpenAI plan

### Features not working
1. Open browser console (F12)
2. Check for error messages
3. Verify API keys are valid
4. Test with the demo page first

### High costs
- Monitor token usage with `useTokenUsage()`
- Increase cache time in `src/lib/queryClient.js`
- Reduce frequency of API calls
- Use mock data for development

## Next Steps

1. **Integrate into your app**: Use the hooks in your components
2. **Customize prompts**: Edit `src/services/openAIService.js` to adjust AI behavior
3. **Add more features**: Extend the service with new AI capabilities
4. **Monitor usage**: Set up alerts for high token usage
5. **Optimize costs**: Implement request batching and smarter caching

## Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Mapbox Directions API](https://docs.mapbox.com/api/navigation/directions/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Full Integration Guide](./OPENAI_INTEGRATION.md)

## Support

Need help? Check:
1. Browser console for errors
2. Token usage tracker for cost monitoring
3. Demo page for working examples
4. [OPENAI_INTEGRATION.md](./OPENAI_INTEGRATION.md) for detailed docs
