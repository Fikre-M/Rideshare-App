# Production Optimization Guide

This guide documents all performance optimizations and AI cost guards implemented in the rideshare app.

## Bundle Optimization

### 1. Vite Manual Chunk Splitting

The app now uses intelligent code splitting to separate:
- **vendor**: React core (react, react-dom, react-router)
- **mui**: Material UI and Emotion
- **charts**: Recharts library
- **maps**: Mapbox GL and Leaflet
- **ai**: OpenAI and Google AI SDKs
- **query**: TanStack Query
- **motion**: Framer Motion
- **utils**: Axios and Socket.io

This ensures users only download what they need when they need it.

### 2. Bundle Analyzer

Run `npm run build` to generate a bundle analysis report at `dist/stats.html`. This visualizes:
- Chunk sizes (raw, gzip, brotli)
- Module dependencies
- Optimization opportunities

### 3. MUI Import Optimization

**IMPORTANT**: Replace all barrel imports with direct imports for proper tree-shaking.

❌ **Bad** (barrel import):
```javascript
import { Button, TextField, Box } from '@mui/material';
```

✅ **Good** (direct import):
```javascript
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
```

**To fix existing files**, use this pattern:
1. Find: `import { X, Y, Z } from '@mui/material';`
2. Replace with individual imports

### 4. Lazy Loading AI Components

All AI feature components are now lazy-loaded with Suspense boundaries:

```javascript
import { 
  LazySmartMatching,
  LazyDynamicPricing,
  LazyRouteOptimizer,
  LazyDemandPredictor,
  LazyPredictiveAnalytics,
} from '@/components/ai/LazyAIComponents';

// Use in your component
<LazySmartMatching />
```

Benefits:
- Reduces initial bundle size
- Loads AI features only when needed
- Shows skeleton loaders during load

### 5. Optimized Framer Motion

Use `OptimizedMotion` instead of full `motion` imports:

❌ **Bad** (full import - 30KB larger):
```javascript
import { motion } from 'framer-motion';
<motion.div animate={{ x: 100 }} />
```

✅ **Good** (optimized import):
```javascript
import { OptimizedMotion } from '@/components/common/OptimizedMotion';
<OptimizedMotion.div animate={{ x: 100 }} />
```

The app is wrapped with `MotionProvider` in `App.jsx`, so all motion components work automatically.

## AI Cost Guards

### 1. AIBudgetGuard Service

Tracks and limits AI API costs in real-time.

**Features**:
- Token usage tracking (input/output/total)
- Cost estimation based on GPT-4o pricing
- Per-feature cost breakdown
- Session-based tracking
- Configurable budget limits
- Warning thresholds

**Usage**:
```javascript
import aiBudgetGuard from '@/services/aiBudgetGuard';

// Check if request can be made
if (aiBudgetGuard.canMakeRequest()) {
  // Make AI call
}

// Track usage after response
aiBudgetGuard.trackUsage('smart_matching', response.usage);

// Get stats
const stats = aiBudgetGuard.getStats();
console.log(`Session cost: ${stats.sessionCost}`);
```

**Configuration**:
```javascript
aiBudgetGuard.configure({
  limit: 1.00,           // $1.00 budget limit
  enabled: true,         // Enable budget tracking
  warningThreshold: 0.8, // Warn at 80%
});
```

### 2. AICostTracker Widget

A collapsible widget that shows live AI costs in the UI.

**Features**:
- Real-time cost display
- Budget progress bar
- Token usage breakdown
- Cost by feature
- Session reset button
- Warning indicators

The widget is automatically included in `App.jsx` and appears in the bottom-right corner.

### 3. useAIQuery Hook

Custom hook for AI queries with built-in optimizations.

**Features**:
- Budget checking before requests
- 800ms debouncing on user input
- 5-minute cache (stale time)
- Request deduplication
- Automatic token tracking
- Error handling

**Usage**:
```javascript
import { useAIQuery } from '@/hooks/useAIQuery';

const { data, isLoading, error, debouncedRefetch } = useAIQuery({
  queryKey: ['smart-matching', driverId],
  queryFn: async () => {
    return await aiService.matchDriverPassenger(request);
  },
  feature: 'smart_matching',
  enabled: true,
  debounce: true,
});
```

### 4. TanStack Query Caching

All AI results are cached for 5 minutes with automatic deduplication:

```javascript
// In src/lib/queryClient.js
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});
```

This means:
- Same query within 5 minutes = instant response from cache
- No duplicate API calls for identical requests
- Significant cost savings on repeated queries

### 5. Debouncing

All AI calls triggered by user input are debounced by 800ms:

```javascript
// Automatic with useAIQuery
const { debouncedRefetch } = useAIQuery({
  // ...
  debounce: true, // 800ms debounce
});

// Manual debouncing
import { useDebounce } from '@/hooks/useDebounce';
const debouncedValue = useDebounce(inputValue, 800);
```

## Pricing Reference

Current GPT-4o pricing (as of 2024):
- Input tokens: $5 per 1M tokens
- Output tokens: $15 per 1M tokens

Example costs:
- Smart matching (avg 500 tokens): ~$0.0075
- Dynamic pricing (avg 400 tokens): ~$0.006
- Route optimization (avg 600 tokens): ~$0.009
- Demand prediction (avg 800 tokens): ~$0.012
- Predictive analytics (avg 1000 tokens): ~$0.015

Default session budget: $0.50 (allows ~50-100 AI calls)

## Testing Optimizations

### Build and Analyze

```bash
# Build for production
npm run build

# Open bundle analyzer
# File will be at: dist/stats.html
```

### Check Bundle Sizes

Look for:
- vendor.js < 200KB (gzipped)
- mui.js < 150KB (gzipped)
- ai.js < 100KB (gzipped)
- app chunks < 50KB each (gzipped)

### Test AI Budget Guards

1. Set a low budget limit (e.g., $0.01)
2. Make several AI calls
3. Verify budget warning appears
4. Verify calls are blocked when limit reached
5. Check cost tracker widget for accuracy

### Test Lazy Loading

1. Open DevTools Network tab
2. Navigate to a page with AI features
3. Verify AI component chunks load on-demand
4. Check for skeleton loaders during load

## Performance Targets

- Initial bundle: < 300KB (gzipped)
- Time to Interactive: < 3s (3G)
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- AI call response: < 2s (cached: < 100ms)

## Monitoring

Monitor these metrics in production:
- Bundle sizes per chunk
- AI API costs per session
- Cache hit rates
- Average tokens per feature
- Budget exceeded frequency

## Future Optimizations

Consider implementing:
- Service Worker for offline caching
- Image optimization with next-gen formats
- Font subsetting
- Critical CSS extraction
- Preloading key chunks
- AI response streaming for better UX
- Token estimation before API calls
- User-configurable AI quality settings (faster/cheaper models)
