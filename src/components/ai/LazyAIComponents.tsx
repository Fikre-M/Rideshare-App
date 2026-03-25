// Lazy-loaded AI components with Suspense boundaries
import { lazy, Suspense } from 'react';
import AIFeatureSkeleton from './AIFeatureSkeleton';

// Lazy load all AI feature components
export const SmartMatching = lazy(() => import('./SmartMatching'));
export const DynamicPricing = lazy(() => import('./DynamicPricing'));
export const RouteOptimizer = lazy(() => import('./RouteOptimizer'));
export const DemandPredictor = lazy(() => import('./DemandPredictor'));
export const PredictiveAnalytics = lazy(() => import('./PredictiveAnalytics'));
export const ChatBot = lazy(() => import('./ChatBot'));
export const AIFeaturesDemo = lazy(() => import('./AIFeaturesDemo'));

// Wrapper components with Suspense and skeleton loaders
export const LazySmartMatching = (props) => (
  <Suspense fallback={<AIFeatureSkeleton />}>
    <SmartMatching {...props} />
  </Suspense>
);

export const LazyDynamicPricing = (props) => (
  <Suspense fallback={<AIFeatureSkeleton />}>
    <DynamicPricing {...props} />
  </Suspense>
);

export const LazyRouteOptimizer = (props) => (
  <Suspense fallback={<AIFeatureSkeleton />}>
    <RouteOptimizer {...props} />
  </Suspense>
);

export const LazyDemandPredictor = (props) => (
  <Suspense fallback={<AIFeatureSkeleton />}>
    <DemandPredictor {...props} />
  </Suspense>
);

export const LazyPredictiveAnalytics = (props) => (
  <Suspense fallback={<AIFeatureSkeleton />}>
    <PredictiveAnalytics {...props} />
  </Suspense>
);

export const LazyChatBot = (props) => (
  <Suspense fallback={<AIFeatureSkeleton variant="compact" />}>
    <ChatBot {...props} />
  </Suspense>
);

export const LazyAIFeaturesDemo = (props) => (
  <Suspense fallback={<AIFeatureSkeleton />}>
    <AIFeaturesDemo {...props} />
  </Suspense>
);
