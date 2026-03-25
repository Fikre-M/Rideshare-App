// Custom hook for AI queries with caching, debouncing, and deduplication
import { useQuery, useQueryClient, useMutation, QueryKey } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import aiBudgetGuard from '../services/aiBudgetGuard';
import { toast } from 'react-hot-toast';
import { useAIStatusStore } from './useAIStatus';

const DEBOUNCE_DELAY = 800;
const STALE_TIME = 5 * 60 * 1000;
const CACHE_TIME = 10 * 60 * 1000;

interface AIQueryOptions {
  queryKey: QueryKey;
  queryFn: (context: any) => Promise<any>;
  feature: string;
  enabled?: boolean;
  debounce?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  [key: string]: unknown;
}

interface AIMutationOptions {
  mutationFn: (variables: any) => Promise<any>;
  feature: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  [key: string]: unknown;
}

/**
 * Custom hook for AI queries with built-in budget checking, debouncing, caching, and deduplication.
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
}: AIQueryOptions) => {
  const queryClient = useQueryClient();
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { setThinking, setReady, setError } = useAIStatusStore();
  
  const canMakeRequest = aiBudgetGuard.canMakeRequest();
  
  const wrappedQueryFn = useCallback(async (context: any) => {
    if (!aiBudgetGuard.canMakeRequest()) {
      const error: any = new Error('AI budget limit exceeded. Please reset or increase your budget.');
      error.code = 'BUDGET_EXCEEDED';
      throw error;
    }
    
    if (aiBudgetGuard.shouldShowWarning()) {
      const stats = aiBudgetGuard.getStats();
      toast(`⚠️ AI budget warning: ${stats.budgetPercentage.toFixed(0)}% used (${aiBudgetGuard.formatCost(stats.sessionCost)})`,
        { id: 'budget-warning', duration: 5000 }
      );
    }
    
    setThinking();
    
    try {
      const result = await queryFn(context);
      if (result?.tokenUsage) {
        aiBudgetGuard.trackUsage(feature, result.tokenUsage);
      }
      setReady();
      return result;
    } catch (error) {
      setError();
      setTimeout(() => setReady(), 3000);
      throw error;
    }
  }, [queryFn, feature, setThinking, setReady, setError]);
  
  const query = useQuery({
    queryKey,
    queryFn: wrappedQueryFn,
    enabled: enabled && canMakeRequest,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: (failureCount: number, error: any) => {
      if (error?.code === 'BUDGET_EXCEEDED') return false;
      return failureCount < 1;
    },
    ...options,
  });

  // Handle side effects via useEffect pattern instead of deprecated callbacks
  const debouncedRefetch = useCallback((..._args: unknown[]) => {
    if (!debounce) {
      return query.refetch();
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    return new Promise<void>((resolve) => {
      debounceTimerRef.current = setTimeout(() => {
        query.refetch().then(() => resolve());
      }, DEBOUNCE_DELAY);
    });
  }, [query, debounce]);
  
  const invalidate = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);
  
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
}: AIMutationOptions) => {
  const wrappedMutationFn = useCallback(async (variables: any) => {
    if (!aiBudgetGuard.canMakeRequest()) {
      const error: any = new Error('AI budget limit exceeded. Please reset or increase your budget.');
      error.code = 'BUDGET_EXCEEDED';
      throw error;
    }
    
    if (aiBudgetGuard.shouldShowWarning()) {
      const stats = aiBudgetGuard.getStats();
      toast(`⚠️ AI budget warning: ${stats.budgetPercentage.toFixed(0)}% used`,
        { id: 'budget-warning', duration: 5000 }
      );
    }
    
    const result = await mutationFn(variables);
    if (result?.tokenUsage) {
      aiBudgetGuard.trackUsage(feature, result.tokenUsage);
    }
    return result;
  }, [mutationFn, feature]);
  
  return useMutation({
    mutationFn: wrappedMutationFn,
    onSuccess,
    onError: (error: any) => {
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
