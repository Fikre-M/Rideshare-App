// Custom hook for AI queries with caching, debouncing, and deduplication
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef, useEffect } from 'react';
import aiBudgetGuard from '../services/aiBudgetGuard';
import { toast } from 'react-hot-toast';
import { useAIStatusStore } from './useAIStatus';

// Debounce delay for AI calls
const DEBOUNCE_DELAY = 800;

// Cache time for AI results (5 minutes)
const STALE_TIME = 5 * 60 * 1000;
const CACHE_TIME = 10 * 60 * 1000;

/**
 * Custom hook for AI queries with built-in:
 * - Budget checking
 * - Debouncing
 * - Caching (5 min stale time)
 * - Request deduplication
 * - Error handling
 */
export const useAIQuery = ({
  queryKey,
  queryFn,
  feature,
  enabled = true,
  debounce = true,
  onSuccess,
  onError,
  ...options
}) => {
  const queryClient = useQueryClient();
  const debounceTimerRef = useRef(null);
  const lastParamsRef = useRef(null);
  const { setThinking, setReady, setError } = useAIStatusStore();
  
  // Check budget before making request
  const canMakeRequest = aiBudgetGuard.canMakeRequest();
  
  // Wrapped query function with budget tracking and status updates
  const wrappedQueryFn = useCallback(async (context) => {
    // Check budget
    if (!aiBudgetGuard.canMakeRequest()) {
      const error = new Error('AI budget limit exceeded. Please reset or increase your budget.');
      error.code = 'BUDGET_EXCEEDED';
      throw error;
    }
    
    // Show warning if approaching limit
    if (aiBudgetGuard.shouldShowWarning()) {
      const stats = aiBudgetGuard.getStats();
      toast.warning(
        `AI budget warning: ${stats.budgetPercentage.toFixed(0)}% used (${aiBudgetGuard.formatCost(stats.sessionCost)})`,
        { id: 'budget-warning', duration: 5000 }
      );
    }
    
    // Set AI status to thinking
    setThinking();
    
    try {
      // Execute the actual query
      const result = await queryFn(context);
      
      // Track usage if available
      if (result?.tokenUsage) {
        aiBudgetGuard.trackUsage(feature, result.tokenUsage);
      }
      
      // Set AI status to ready
      setReady();
      
      return result;
    } catch (error) {
      // Set AI status to error
      setError();
      
      // Reset to ready after 3 seconds
      setTimeout(() => setReady(), 3000);
      
      // Don't track usage on errors
      throw error;
    }
  }, [queryFn, feature, setThinking, setReady, setError]);
  
  // Use TanStack Query with caching and deduplication
  const query = useQuery({
    queryKey,
    queryFn: wrappedQueryFn,
    enabled: enabled && canMakeRequest,
    staleTime: STALE_TIME,
    cacheTime: CACHE_TIME,
    retry: (failureCount, error) => {
      // Don't retry on budget errors
      if (error?.code === 'BUDGET_EXCEEDED') return false;
      // Retry other errors once
      return failureCount < 1;
    },
    onSuccess: (data) => {
      if (onSuccess) onSuccess(data);
    },
    onError: (error) => {
      if (error?.code === 'BUDGET_EXCEEDED') {
        toast.error('AI budget limit reached. Reset tracking or increase limit in settings.', {
          duration: 6000,
          id: 'budget-exceeded',
        });
      } else if (onError) {
        onError(error);
      }
    },
    ...options,
  });
  
  // Debounced refetch
  const debouncedRefetch = useCallback((...args) => {
    if (!debounce) {
      return query.refetch();
    }
    
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new timer
    return new Promise((resolve) => {
      debounceTimerRef.current = setTimeout(() => {
        query.refetch().then(resolve);
      }, DEBOUNCE_DELAY);
    });
  }, [query, debounce]);
  
  // Invalidate cache for this query
  const invalidate = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);
  
  // Clear cache for this query
  const clearCache = useCallback(() => {
    return queryClient.removeQueries({ queryKey });
  }, [queryClient, queryKey]);
  
  return {
    ...query,
    debouncedRefetch,
    invalidate,
    clearCache,
    canMakeRequest,
    budgetExceeded: !canMakeRequest,
  };
};

/**
 * Hook for AI mutations with budget tracking
 */
export const useAIMutation = ({
  mutationFn,
  feature,
  onSuccess,
  onError,
  ...options
}) => {
  const { useMutation } = require('@tanstack/react-query');
  
  // Wrapped mutation function with budget tracking
  const wrappedMutationFn = useCallback(async (variables) => {
    // Check budget
    if (!aiBudgetGuard.canMakeRequest()) {
      const error = new Error('AI budget limit exceeded. Please reset or increase your budget.');
      error.code = 'BUDGET_EXCEEDED';
      throw error;
    }
    
    // Show warning if approaching limit
    if (aiBudgetGuard.shouldShowWarning()) {
      const stats = aiBudgetGuard.getStats();
      toast.warning(
        `AI budget warning: ${stats.budgetPercentage.toFixed(0)}% used`,
        { id: 'budget-warning', duration: 5000 }
      );
    }
    
    try {
      const result = await mutationFn(variables);
      
      // Track usage if available
      if (result?.tokenUsage) {
        aiBudgetGuard.trackUsage(feature, result.tokenUsage);
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  }, [mutationFn, feature]);
  
  return useMutation({
    mutationFn: wrappedMutationFn,
    onSuccess,
    onError: (error) => {
      if (error?.code === 'BUDGET_EXCEEDED') {
        toast.error('AI budget limit reached. Reset tracking or increase limit.', {
          duration: 6000,
          id: 'budget-exceeded',
        });
      } else if (onError) {
        onError(error);
      }
    },
    ...options,
  });
};

export default useAIQuery;
