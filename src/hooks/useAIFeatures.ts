// React Query hooks for AI features with caching and error handling
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import openAIService from '../services/openAIService';
import mapboxService from '../services/mapboxService';

interface Coordinate {
  lat: number;
  lng: number;
}

interface RouteOptimizationResult {
  routes: any[];
  recommendation: any;
  recommendedRoute: any;
}

interface TokenUsage {
  total: number;
  byFeature: Record<string, number>;
}

// Smart Driver Matching Hook
export const useSmartMatching = (options: Record<string, unknown> = {}) => {
  return useMutation({
    mutationFn: async ({ drivers, passengerPreferences }: { drivers: any[]; passengerPreferences: any }) => {
      return await openAIService.matchDriverToPassenger(drivers, passengerPreferences);
    },
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
};

// Dynamic Pricing Hook
export const useDynamicPricing = (pricingContext: Record<string, unknown> | null, options: Record<string, unknown> = {}) => {
  return useQuery({
    queryKey: ['dynamic-pricing', pricingContext],
    queryFn: async () => {
      return await openAIService.calculateDynamicPricing(pricingContext ?? {});
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    enabled: !!pricingContext && Object.keys(pricingContext).length > 0,
    retry: 2,
    ...options,
  });
};

// Route Optimization Hook (combines Mapbox + OpenAI)
export const useRouteOptimization = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const optimizeRoute = useCallback(async (
    origin: Coordinate,
    destination: Coordinate,
    userPreferences: Record<string, unknown> = {}
  ): Promise<RouteOptimizationResult> => {
    setIsOptimizing(true);
    setError(null);

    try {
      const mapboxResult = await mapboxService.getRouteWithTraffic(origin, destination, {
        alternatives: true,
      });

      if (!mapboxResult.routes || mapboxResult.routes.length === 0) {
        throw new Error('No routes found');
      }

      const aiResult = await openAIService.optimizeRoute(mapboxResult.routes, userPreferences);

      setIsOptimizing(false);
      return {
        routes: mapboxResult.routes,
        recommendation: aiResult,
        recommendedRoute: mapboxResult.routes[aiResult.recommendedRouteIndex],
      };
    } catch (err) {
      setError(err as Error);
      setIsOptimizing(false);
      throw err;
    }
  }, []);

  return { optimizeRoute, isOptimizing, error };
};

// Demand Prediction Hook
export const useDemandPrediction = (demandContext: Record<string, unknown> | null, options: Record<string, unknown> = {}) => {
  return useQuery({
    queryKey: ['demand-prediction', demandContext],
    queryFn: async () => {
      return await openAIService.predictDemand(demandContext ?? {});
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    enabled: !!demandContext && Object.keys(demandContext).length > 0,
    retry: 2,
    ...options,
  });
};

// Predictive Analytics Hook
export const usePredictiveAnalytics = (analyticsContext: Record<string, unknown> | null, options: Record<string, unknown> = {}) => {
  return useQuery({
    queryKey: ['predictive-analytics', analyticsContext],
    queryFn: async () => {
      return await openAIService.getPredictiveAnalytics(analyticsContext ?? {});
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    enabled: !!analyticsContext,
    retry: 2,
    ...options,
  });
};

// Token Usage Hook
export const useTokenUsage = () => {
  const [usage, setUsage] = useState<TokenUsage>(openAIService.getTokenUsage());

  const refreshUsage = useCallback(() => {
    setUsage(openAIService.getTokenUsage());
  }, []);

  const resetUsage = useCallback(() => {
    openAIService.resetTokenUsage();
    setUsage(openAIService.getTokenUsage());
  }, []);

  return { usage, refreshUsage, resetUsage };
};

// Streaming Chat Hook
export const useStreamingChat = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const [error, setError] = useState<Error | null>(null);

  const streamChat = useCallback(async (messages: any[], options: Record<string, unknown> = {}) => {
    setIsStreaming(true);
    setStreamedContent('');
    setError(null);

    try {
      const stream = openAIService.streamChatCompletion(messages, options);
      for await (const chunk of stream) {
        setStreamedContent(prev => prev + chunk);
      }
      setIsStreaming(false);
    } catch (err) {
      setError(err as Error);
      setIsStreaming(false);
      throw err;
    }
  }, []);

  const resetStream = useCallback(() => {
    setStreamedContent('');
    setError(null);
  }, []);

  return { streamChat, isStreaming, streamedContent, error, resetStream };
};

// Mapbox Directions Hook
export const useMapboxDirections = (options: Record<string, unknown> = {}) => {
  return useMutation({
    mutationFn: async ({ coordinates, routeOptions }: { coordinates: Coordinate[]; routeOptions?: Record<string, unknown> }) => {
      return await mapboxService.getDirections(coordinates, routeOptions);
    },
    retry: 2,
    ...options,
  });
};

// Geocoding Hook
export const useGeocoding = () => {
  const geocode = useMutation({
    mutationFn: async (address: string) => {
      return await mapboxService.geocodeAddress(address);
    },
    retry: 1,
  });

  const reverseGeocode = useMutation({
    mutationFn: async (coordinates: Coordinate) => {
      return await mapboxService.reverseGeocode(coordinates);
    },
    retry: 1,
  });

  return { geocode, reverseGeocode };
};

// Combined AI Service Status Hook
export const useAIServiceStatus = () => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState({ openAI: 'unknown', mapbox: 'unknown' });

  const checkStatus = useCallback(async () => {
    try {
      (openAIService as any).getClient?.();
      setStatus(prev => ({ ...prev, openAI: 'connected' }));
    } catch {
      setStatus(prev => ({ ...prev, openAI: 'error' }));
    }

    try {
      mapboxService.getAccessToken();
      setStatus(prev => ({ ...prev, mapbox: 'connected' }));
    } catch {
      setStatus(prev => ({ ...prev, mapbox: 'error' }));
    }
  }, []);

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['dynamic-pricing'] });
    queryClient.invalidateQueries({ queryKey: ['demand-prediction'] });
    queryClient.invalidateQueries({ queryKey: ['predictive-analytics'] });
  }, [queryClient]);

  return { status, checkStatus, invalidateAll };
};
