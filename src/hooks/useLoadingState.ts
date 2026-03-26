/**
 * Loading States Hook
 * Provides consistent loading state management for async operations
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export interface LoadingState {
  isLoading: boolean;
  isRetrying: boolean;
  attempt: number;
  maxRetries: number;
  error: Error | null;
  lastSuccess: any;
}

export interface UseLoadingStateOptions {
  maxRetries?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  onRetry?: (attempt: number) => void;
}

/**
 * Hook for managing loading states with retry support
 */
export const useLoadingState = (options: UseLoadingStateOptions = {}) => {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    isRetrying: false,
    attempt: 0,
    maxRetries: options.maxRetries || 3,
    error: null,
    lastSuccess: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const startLoading = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      isRetrying: prev.attempt > 0,
      error: null,
    }));
  }, []);

  const stopLoading = useCallback((success = false, data?: any, error?: Error) => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      isRetrying: false,
      error: success ? null : (error || new Error('Operation failed')),
      lastSuccess: success ? data : prev.lastSuccess,
      attempt: success ? 0 : prev.attempt,
    }));
  }, []);

  const incrementAttempt = useCallback(() => {
    setState(prev => ({
      ...prev,
      attempt: prev.attempt + 1,
      isRetrying: true,
    }));
  }, []);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState({
      isLoading: false,
      isRetrying: false,
      attempt: 0,
      maxRetries: options.maxRetries || 3,
      error: null,
      lastSuccess: null,
    });
  }, [options.maxRetries]);

  const execute = useCallback(async <T>(
    operation: () => Promise<T>,
    retryCondition?: (error: Error) => boolean
  ): Promise<T> => {
    // Cancel any previous operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    try {
      startLoading();

      let attempt = 0;
      let lastError: Error | undefined;

      while (attempt <= state.maxRetries) {
        if (signal.aborted) {
          throw new Error('Operation cancelled');
        }

        try {
          const result = await operation();
          
          // Success
          stopLoading(true, result);
          options.onSuccess?.(result);
          return result;
          
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          
          // Check if we should retry
          if (attempt < state.maxRetries && 
              (!retryCondition || retryCondition(lastError))) {
            attempt++;
            incrementAttempt();
            options.onRetry?.(attempt);
            
            // Wait before retry
            if (options.retryDelay && options.retryDelay > 0) {
              await new Promise(resolve => setTimeout(resolve, options.retryDelay));
            }
            
            continue;
          }
          
          // No more retries or not retryable
          throw lastError;
        }
      }

      // This should never be reached, but TypeScript needs it
      throw lastError || new Error('Operation failed');
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      stopLoading(false, undefined, err);
      options.onError?.(err);
      throw err;
    }
  }, [state.maxRetries, startLoading, stopLoading, incrementAttempt, options]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    execute,
    startLoading,
    stopLoading,
    reset,
    incrementAttempt,
    canRetry: state.attempt < state.maxRetries,
    progress: state.maxRetries > 0 ? (state.attempt / state.maxRetries) * 100 : 0,
  };
};

/**
 * Hook for managing multiple loading states
 */
export const useMultiLoadingState = (keys: string[], options: UseLoadingStateOptions = {}) => {
  const [states, setStates] = useState<Record<string, LoadingState>>(() => 
    keys.reduce((acc, key) => ({
      ...acc,
      [key]: {
        isLoading: false,
        isRetrying: false,
        attempt: 0,
        maxRetries: options.maxRetries || 3,
        error: null,
        lastSuccess: null,
      }
    }), {})
  );

  const setLoading = useCallback((key: string, loading: boolean, isRetrying = false) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        isLoading: loading,
        isRetrying: isRetrying,
        error: loading ? null : prev[key].error,
      }
    }));
  }, []);

  const setError = useCallback((key: string, error: Error | null) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        error,
        isLoading: false,
        isRetrying: false,
      }
    }));
  }, []);

  const setSuccess = useCallback((key: string, data: any) => {
    setStates(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        isLoading: false,
        isRetrying: false,
        error: null,
        lastSuccess: data,
        attempt: 0,
      }
    }));
  }, []);

  const reset = useCallback((key?: string) => {
    if (key) {
      setStates(prev => ({
        ...prev,
        [key]: {
          isLoading: false,
          isRetrying: false,
          attempt: 0,
          maxRetries: options.maxRetries || 3,
          error: null,
          lastSuccess: null,
        }
      }));
    } else {
      setStates(keys.reduce((acc, k) => ({
        ...acc,
        [k]: {
          isLoading: false,
          isRetrying: false,
          attempt: 0,
          maxRetries: options.maxRetries || 3,
          error: null,
          lastSuccess: null,
        }
      }), {}));
    }
  }, [keys, options.maxRetries]);

  const isLoadingAny = Object.values(states).some(state => state.isLoading);
  const hasErrors = Object.values(states).some(state => state.error);
  const allSuccessful = Object.values(states).every(state => state.lastSuccess !== null);

  return {
    states,
    setLoading,
    setError,
    setSuccess,
    reset,
    isLoadingAny,
    hasErrors,
    allSuccessful,
    getProgress: (key: string) => {
      const state = states[key];
      return state.maxRetries > 0 ? (state.attempt / state.maxRetries) * 100 : 0;
    }
  };
};

/**
 * Hook for debounced loading states
 */
export const useDebouncedLoading = (delay = 300) => {
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const setLoading = useCallback((loading: boolean) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (loading) {
      setIsLoading(true);
    } else {
      timeoutRef.current = setTimeout(() => {
        setIsLoading(false);
      }, delay);
    }
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { isLoading, setLoading };
};

export default useLoadingState;
