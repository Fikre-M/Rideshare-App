# Quick Reference - Production Optimizations

## 🚀 Quick Start

### Run Bundle Analysis
```bash
npm run build
# Open dist/stats.html in browser
```

### Check AI Budget
```javascript
import aiBudgetGuard from '@/services/aiBudgetGuard';

// Get current stats
const stats = aiBudgetGuard.getStats();
console.log(`Cost: $${stats.sessionCost.toFixed(4)}`);
console.log(`Budget: ${stats.budgetPercentage.toFixed(0)}%`);
```

## 📦 Import Patterns

### ✅ MUI Components (Optimized)
```javascript
// Direct imports for tree-shaking
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
```

### ✅ MUI Icons (Optimized)
```javascript
// Direct imports
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
```

### ✅ Framer Motion (Optimized)
```javascript
import { OptimizedMotion, animationVariants } from '@/components/common/OptimizedMotion';

<OptimizedMotion.div
  initial={animationVariants.fadeIn.initial}
  animate={animationVariants.fadeIn.animate}
>
  Content
</OptimizedMotion.div>
```

### ✅ Lazy AI Components
```javascript
import { 
  LazySmartMatching,
  LazyDynamicPricing,
  LazyRouteOptimizer,
} from '@/components/ai/LazyAIComponents';

// Automatically shows skeleton during load
<LazySmartMatching />
```

## 🤖 AI Query Hook

### Basic Usage
```javascript
import { useAIQuery } from '@/hooks/useAIQuery';

const { data, isLoading, error } = useAIQuery({
  queryKey: ['feature-name', params],
  queryFn: async () => {
    return await aiService.someMethod(params);
  },
  feature: 'feature_name', // For cost tracking
  enabled: true,
  debounce: true, // 800ms debounce
});
```

### With Debounced Refetch
```javascript
const { data, debouncedRefetch } = useAIQuery({
  queryKey: ['search', query],
  queryFn: () => aiService.search(query),
  feature: 'search',
  debounce: true,
});

// Trigger on input change
const handleChange = (e) => {
  setQuery(e.target.value);
  debouncedRefetch(); // Waits 800ms
};
```

### Check Budget Status
```javascript
const { canMakeRequest, budgetExceeded } = useAIQuery({
  // ... config
});

if (budgetExceeded) {
  // Show warning or disable feature
}
```

## 💰 Budget Management

### Configure Budget
```javascript
import aiBudgetGuard from '@/services/aiBudgetGuard';

aiBudgetGuard.configure({
  limit: 1.00,           // $1.00 limit
  enabled: true,         // Enable tracking
  warningThreshold: 0.8, // Warn at 80%
});
```

### Check Before Request
```javascript
if (aiBudgetGuard.canMakeRequest()) {
  // Make AI call
  const result = await openAIService.someMethod();
  
  // Track usage
  aiBudgetGuard.trackUsage('feature_name', result.tokenUsage);
}
```

### Reset Session
```javascript
aiBudgetGuard.resetSession();
```

### Get Statistics
```javascript
const stats = aiBudgetGuard.getStats();
// {
//   sessionCost: 0.0234,
//   sessionTokens: { input: 1200, output: 800, total: 2000 },
//   costByFeature: { smart_matching: 0.0100, ... },
//   budgetLimit: 0.50,
//   remainingBudget: 0.4766,
//   budgetPercentage: 4.68,
//   budgetExceeded: false,
//   sessionDuration: 123456,
// }
```

## 🎨 Animation Variants

### Pre-built Variants
```javascript
import { animationVariants } from '@/components/common/OptimizedMotion';

// Available variants:
animationVariants.fadeIn
animationVariants.slideUp
animationVariants.slideDown
animationVariants.slideLeft
animationVariants.slideRight
animationVariants.scale
animationVariants.scaleUp
```

### Usage
```javascript
<OptimizedMotion.div
  initial={animationVariants.slideUp.initial}
  animate={animationVariants.slideUp.animate}
  exit={animationVariants.slideUp.exit}
>
  Content
</OptimizedMotion.div>
```

## 🔧 Common Tasks

### Add New AI Feature
1. Create component in `src/components/ai/`
2. Use `useAIQuery` hook
3. Add to `LazyAIComponents.jsx`
4. Import lazy version in parent

### Fix MUI Imports in File
```bash
# Find barrel imports
grep "from '@mui/material'" src/path/to/file.jsx

# Replace manually or use script
node scripts/fix-mui-imports.js
```

### Test Bundle Size
```bash
npm run build
ls -lh dist/assets/*.js
# Check gzipped sizes
```

### Monitor AI Costs
1. Open app
2. Look for cost tracker widget (bottom-right)
3. Click to expand
4. View cost breakdown

## 📊 Pricing Reference

### GPT-4o
- Input: $5 per 1M tokens
- Output: $15 per 1M tokens

### Typical Costs
- Smart matching: ~$0.0075 per call
- Dynamic pricing: ~$0.006 per call
- Route optimization: ~$0.009 per call
- Demand prediction: ~$0.012 per call
- Predictive analytics: ~$0.015 per call

### Budget Recommendations
- Development: $0.50 per session
- Testing: $1.00 per session
- Production: $5.00 per session (with monitoring)

## 🐛 Troubleshooting

### Budget Exceeded Error
```javascript
// Check budget status
const stats = aiBudgetGuard.getStats();
console.log(stats);

// Reset if needed
aiBudgetGuard.resetSession();

// Or increase limit
aiBudgetGuard.configure({ limit: 1.00 });
```

### Cache Not Working
```javascript
// Check query key is stable
const { data } = useAIQuery({
  queryKey: ['feature', JSON.stringify(params)], // ✅ Stable
  // NOT: queryKey: ['feature', { ...params }],  // ❌ New object each render
});
```

### Bundle Too Large
1. Run bundle analyzer: `npm run build`
2. Check `dist/stats.html`
3. Look for:
   - Barrel imports (MUI)
   - Duplicate dependencies
   - Large unused libraries
4. Fix MUI imports: `node scripts/fix-mui-imports.js`

### Motion Not Working
```javascript
// Ensure MotionProvider is in App.jsx
import { MotionProvider } from '@/components/common/OptimizedMotion';

<MotionProvider>
  <App />
</MotionProvider>
```

## 📚 Documentation

- **OPTIMIZATION_GUIDE.md**: Detailed guide
- **PRODUCTION_OPTIMIZATION_SUMMARY.md**: Implementation summary
- **src/components/ai/SmartMatching.optimized.example.jsx**: Example component

## 🎯 Performance Targets

- Initial bundle: < 300KB (gzipped)
- AI chunks: < 100KB each (gzipped)
- Time to Interactive: < 3s (3G)
- Cache hit rate: > 60%
- AI cost per session: < $0.10

## ✅ Pre-Deployment Checklist

- [ ] MUI imports optimized
- [ ] AI components use useAIQuery
- [ ] Motion imports optimized
- [ ] Bundle analyzed and within targets
- [ ] Budget limits configured
- [ ] All tests passing
- [ ] Cost tracker visible
- [ ] Caching working
- [ ] Debouncing working
- [ ] No console errors
