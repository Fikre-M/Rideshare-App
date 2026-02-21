# AI-Native UI Quick Reference

## 🎨 Component Cheat Sheet

### GlassCard
```tsx
import { GlassCard } from '@/components/modern';

<GlassCard variant="elevated" blur="medium" hover sx={{ p: 3 }}>
  Content
</GlassCard>
```
**Variants**: `default` | `elevated` | `subtle`  
**Blur**: `light` | `medium` | `heavy`

---

### AIConfidenceIndicator
```tsx
import { AIConfidenceIndicator } from '@/components/modern';

<AIConfidenceIndicator 
  confidence={85} 
  size="medium"
  showIcon
  showLabel
  animated
/>
```
**Colors**: Green (80-100%) | Yellow (60-79%) | Red (0-59%)

---

### AIReasoningPanel
```tsx
import { AIReasoningPanel } from '@/components/modern';

<AIReasoningPanel
  reasoning={["Reason 1", "Reason 2"]}
  title="Why did AI decide this?"
  defaultExpanded={false}
  variant="default"
/>
```
**Variants**: `default` | `compact`

---

### StreamingText
```tsx
import { StreamingText } from '@/components/modern';

<StreamingText
  text="AI response..."
  speed={20}
  showCursor
  onComplete={() => {}}
/>
```
**Speed**: milliseconds per character (default: 20)

---

### AIStatusIndicator
```tsx
import { AIStatusIndicator } from '@/components/modern';
import { useAIStatus } from '@/hooks/useAIStatus';

const { status } = useAIStatus();
<AIStatusIndicator status={status} compact={false} showIcon />
```
**Status**: `ready` | `thinking` | `offline` | `error`

---

### CommandPalette
```tsx
// Already integrated in App.jsx
// Press Cmd+K (Mac) or Ctrl+K (Windows/Linux)
```
**Shortcut**: `⌘K` / `Ctrl+K`

---

### AnimatedNumber
```tsx
import { AnimatedNumber } from '@/components/modern';

<AnimatedNumber
  value={1250}
  duration={1000}
  decimals={2}
  prefix="$"
  suffix=" USD"
  startOnView
/>
```

---

### StaggeredList
```tsx
import { StaggeredList } from '@/components/modern';

<StaggeredList staggerDelay={0.1}>
  {items.map(item => <Item key={item.id} {...item} />)}
</StaggeredList>
```

---

### Skeleton Loaders
```tsx
import { 
  SmartMatchingSkeleton,
  DynamicPricingSkeleton,
  RouteOptimizerSkeleton,
  PredictiveAnalyticsSkeleton,
  ChatBotSkeleton,
} from '@/components/modern';

{isLoading ? <SmartMatchingSkeleton /> : <SmartMatching />}
```

---

## 🎯 Common Patterns

### Pattern 1: AI Result Card
```tsx
<GlassCard variant="elevated" sx={{ p: 3 }}>
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
    <Typography variant="h6">Result</Typography>
    <AIConfidenceIndicator confidence={85} />
  </Box>
  
  <YourContent />
  
  <AIReasoningPanel
    reasoning={["Reason 1", "Reason 2"]}
    title="Why this result?"
  />
</GlassCard>
```

### Pattern 2: Animated Metric
```tsx
<GlassCard variant="subtle" sx={{ p: 2, textAlign: 'center' }}>
  <Typography variant="h3">
    <AnimatedNumber value={1250} prefix="$" decimals={2} />
  </Typography>
  <Typography variant="caption" color="text.secondary">
    Total Revenue
  </Typography>
</GlassCard>
```

### Pattern 3: Staggered Results
```tsx
<StaggeredList staggerDelay={0.1}>
  {results.map(result => (
    <GlassCard key={result.id} hover sx={{ p: 2, mb: 2 }}>
      <ResultItem {...result} />
    </GlassCard>
  ))}
</StaggeredList>
```

### Pattern 4: Loading State
```tsx
{isLoading ? (
  <SmartMatchingSkeleton />
) : (
  <SmartMatching data={data} />
)}
```

### Pattern 5: AI Status in Header
```tsx
import { useAIStatus } from '@/hooks/useAIStatus';
import { AIStatusIndicator } from '@/components/modern';

const Header = () => {
  const { status } = useAIStatus();
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Logo />
      <AIStatusIndicator status={status} />
    </Box>
  );
};
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Open command palette |
| `Esc` | Close modal/palette |
| `Tab` | Navigate forward |
| `Shift+Tab` | Navigate backward |
| `Enter` / `Space` | Activate button |
| `↑` `↓` | Navigate list |

---

## 🎨 Color Reference

```tsx
// AI States
primary.main      // #1976d2 - AI actions, thinking
success.main      // #10b981 - High confidence, ready
warning.main      // #f59e0b - Medium confidence
error.main        // #ef4444 - Low confidence, error

// Glass Effects
rgba(255, 255, 255, 0.7)  // Default glass
rgba(255, 255, 255, 0.85) // Elevated glass
rgba(255, 255, 255, 0.5)  // Subtle glass
```

---

## 📏 Spacing Scale

```tsx
theme.spacing(1)  // 8px
theme.spacing(2)  // 16px
theme.spacing(3)  // 24px
theme.spacing(4)  // 32px
```

---

## 🎬 Animation Presets

```tsx
import { animationVariants } from '@/components/common/OptimizedMotion';

// Available variants
animationVariants.fadeIn
animationVariants.slideUp
animationVariants.slideDown
animationVariants.slideLeft
animationVariants.slideRight
animationVariants.scale
animationVariants.scaleUp
```

---

## 🔧 Hooks

### useAIStatus
```tsx
import { useAIStatus } from '@/hooks/useAIStatus';

const { 
  status,           // Current status
  setThinking,      // Set to thinking
  setReady,         // Set to ready
  setOffline,       // Set to offline
  setError,         // Set to error
} = useAIStatus();
```

### useAIQuery (with auto status)
```tsx
import { useAIQuery } from '@/hooks/useAIQuery';

const { data, isLoading, error } = useAIQuery({
  queryKey: ['feature', params],
  queryFn: () => aiService.method(params),
  feature: 'feature_name',
  debounce: true,
});
// Automatically updates AI status!
```

---

## 📱 Responsive Breakpoints

```tsx
// Mobile
sx={{ display: { xs: 'block', md: 'none' } }}

// Tablet
sx={{ display: { xs: 'none', md: 'block', lg: 'none' } }}

// Desktop
sx={{ display: { xs: 'none', lg: 'block' } }}

// Grid
sx={{ 
  gridTemplateColumns: { 
    xs: '1fr', 
    md: 'repeat(2, 1fr)', 
    lg: 'repeat(3, 1fr)' 
  } 
}}
```

---

## ♿ Accessibility

### ARIA Labels
```tsx
<Box 
  role="status" 
  aria-label="AI is processing"
  aria-live="polite"
>
  <AIStatusIndicator status="thinking" />
</Box>
```

### Keyboard Navigation
```tsx
<Box
  tabIndex={0}
  role="button"
  aria-label="Expand details"
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }}
>
  Clickable Content
</Box>
```

---

## 🐛 Troubleshooting

### Glass effect not visible?
- Check backdrop-filter browser support
- Ensure content exists behind the card
- Try different blur levels

### Animations laggy?
- Check for heavy re-renders
- Use React DevTools Profiler
- Consider reducing motion

### Command palette not opening?
- Verify keyboard event listener
- Check for conflicting shortcuts
- Ensure cmdk is installed

### Status not updating?
- Check useAIQuery integration
- Verify Zustand store
- Check console for errors

---

## 📚 Import Paths

```tsx
// Modern components
import { ... } from '@/components/modern';

// Hooks
import { useAIStatus } from '@/hooks/useAIStatus';
import { useAIQuery } from '@/hooks/useAIQuery';

// Optimized motion
import { OptimizedMotion, animationVariants } from '@/components/common/OptimizedMotion';
```

---

## 🎯 Quick Wins

1. **Wrap any card** → `<GlassCard>`
2. **Add confidence** → `<AIConfidenceIndicator confidence={85} />`
3. **Show reasoning** → `<AIReasoningPanel reasoning={[...]} />`
4. **Animate numbers** → `<AnimatedNumber value={1250} />`
5. **Stagger lists** → `<StaggeredList>{items}</StaggeredList>`
6. **Better loading** → Use specific skeleton loaders
7. **Show AI status** → `<AIStatusIndicator status={status} />`

---

## 📖 Full Documentation

- **AI_NATIVE_UI_GUIDE.md** - Complete usage guide
- **AI_UI_IMPLEMENTATION_SUMMARY.md** - Implementation details
- **AI_UI_QUICK_REFERENCE.md** - This file

---

**Tip**: All components are TypeScript-ready with full type definitions!
