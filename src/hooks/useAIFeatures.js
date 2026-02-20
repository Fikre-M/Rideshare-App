// React Query hooks for AI features with caching and error handling
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import openAIService from '../services/openAIService';
import mapboxService from '../services/mapboxService';

// Smart Driver Matching Hook
export const useSmartMatching = (options = {}) => {
  return useMutation({
    mutationFn: async ({ drivers, passengerPreferences }) => {
      return await openAIService.matchDriverToPassenger(drivers, passengerPreferences);
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
};

// Dynamic Pricing Hook
export const useDynamicPricing = (pricingContext, options = {}) => {
  return useQuery({
    queryKey: ['dynamic-pricing', pricingContext],
    queryFn: async () => {
      return await openAIService.calculateDynamicPricing(pricingContext);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    enabled: !!pricingContext && Object.keys(pricingContext).length > 0,
    retry: 2,
    ...options,
  });
};

// Route Optimization Hook (combines Mapbox + OpenAI)
export const useRouteOptimization = (options = {}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState(null);

  const optimizeRoute = useCallback(async (origin, destination, userPreferences = {}) => {
    setIsOptimizing(true);
    setError(null);

    try {
      // Step 1: Fetch real routes from Mapbox
      const mapboxResult = await mapboxService.getRouteWithTraffic(origin, destination, {
        alternatives: true,
      });

      if (!mapboxResult.routes || mapboxResult.routes.length === 0) {
        throw new Error('No routes found');
      }

      // Step 2: Pass routes to OpenAI for intelligent recommendation
      const aiResult = await openAIService.optimizeRoute(
        mapboxResult.routes,
        userPreferences
      );

      setIsOptimizing(false);

      return {
        routes: mapboxResult.routes,
        recommendation: aiResult,
        recommendedRoute: mapboxResult.routes[aiResult.recommendedRouteIndex],
      };
    } catch (err) {
      setError(err);
      setIsOptimizing(false);
      throw err;
    }
  }, []);

  return {
    optimizeRoute,
    isOptimizing,
    error,
  };
};

// Demand Prediction Hook
export const useDemandPrediction = (demandContext, options = {}) => {
  return useQuery({
    queryKey: ['demand-prediction', demandContext],
    queryFn: async () => {
      return await openAIService.predictDemand(demandContext);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 15, // 15 minutes
    enabled: !!demandContext && Object.keys(demandContext).length > 0,
    retry: 2,
    ...options,
  });
};

// Predictive Analytics Hook
export const usePredictiveAnalytics = (analyticsContext, options = {}) => {
  return useQuery({
    queryKey: ['predictive-analytics', analyticsContext],
    queryFn: async () => {
      return await openAIService.getPredictiveAnalytics(analyticsContext);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!analyticsContext,
    retry: 2,
    ...options,
  });
};

// Token Usage Hook
export const useTokenUsage = () => {
  const [usage, setUsage] = useState(openAIService.getTokenUsage());

  const refreshUsage = useCallback(() => {
    setUsage(openAIService.getTokenUsage());
  }, []);

  const resetUsage = useCallback(() => {
    openAIService.resetTokenUsage();
    setUsage(openAIService.getTokenUsage());
  }, []);

  return {
    usage,
    refreshUsage,
    resetUsage,
  };
};

// Streaming Chat Hook
export const useStreamingChat = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const [error, setError] = useState(null);

  const streamChat = useCallback(async (messages, options = {}) => {
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
      setError(err);
      setIsStreaming(false);
      throw err;
    }
  }, []);

  const resetStream = useCallback(() => {
    setStreamedContent('');
    setError(null);
  }, []);

  return {
    streamChat,
    isStreaming,
    streamedContent,
    error,
    resetStream,
  };
};

// Mapbox Directions Hook
export const useMapboxDirections = (options = {}) => {
  return useMutation({
    mutationFn: async ({ coordinates, routeOptions }) => {
      return await mapboxService.getDirections(coordinates, routeOptions);
    },
    retry: 2,
    ...options,
  });
};

// Geocoding Hook
export const useGeocoding = () => {
  const geocode = useMutation({
    mutationFn: async (address) => {
      return await mapboxService.geocodeAddress(address);
    },
    retry: 1,
  });

  const reverseGeocode = useMutation({
    mutationFn: async (coordinates) => {
      return await mapboxService.reverseGeocode(coordinates);
    },
    retry: 1,
  });

  return {
    geocode,
    reverseGeocode,
  };
};

// Combined AI Service Status Hook
export const useAIServiceStatus = () => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState({
    openAI: 'unknown',
    mapbox: 'unknown',
  });

  const checkStatus = useCallback(async () => {
    // Check OpenAI
    try {
      openAIService.getClient();
      setStatus(prev => ({ ...prev, openAI: 'connected' }));
    } catch (err) {
      setStatus(prev => ({ ...prev, openAI: 'error' }));
    }

    // Check Mapbox
    try {
      mapboxService.getAccessToken();
      setStatus(prev => ({ ...prev, mapbox: 'connected' }));
    } catch (err) {
      setStatus(prev => ({ ...prev, mapbox: 'error' }));
    }
  }, []);

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['dynamic-pricing'] });
    queryClient.invalidateQueries({ queryKey: ['demand-prediction'] });
    queryClient.invalidateQueries({ queryKey: ['predictive-analytics'] });
  }, [queryClient]);

  return {
    status,
    checkStatus,
    invalidateAll,
  };
};
