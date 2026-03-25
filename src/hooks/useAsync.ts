import { useState, useCallback, useRef, useEffect } from 'react';

interface AsyncOptions<T> {
  initialLoading?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  throwOnError?: boolean;
}

interface AsyncStatus<T> {
  isLoading: boolean;
  error: Error | null;
  data: T | null;
}

const useAsync = <T = unknown>(
  asyncFunction: ((...args: any[]) => Promise<T>) | null | undefined,
  options: AsyncOptions<T> = {}
) => {
  const {
    initialLoading = false,
    onSuccess,
    onError,
    throwOnError = false,
  } = options;

  const [status, setStatus] = useState<AsyncStatus<T>>({
    isLoading: initialLoading,
    error: null,
    data: null,
  });

  const isMounted = useRef(true);
  const lastCallId = useRef(0);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: any[]): Promise<T | null> => {
      if (!asyncFunction) return null;

      const callId = ++lastCallId.current;
      
      try {
        setStatus(prev => ({ ...prev, isLoading: true, error: null }));
        
        const result = await asyncFunction(...args);
        
        if (isMounted.current && callId === lastCallId.current) {
          setStatus({ isLoading: false, error: null, data: result });
          if (onSuccess) onSuccess(result);
        }
        
        return result;
      } catch (error) {
        console.error('useAsync error:', error);
        
        if (isMounted.current && callId === lastCallId.current) {
          setStatus(prev => ({ ...prev, isLoading: false, error: error as Error }));
          if (onError) onError(error as Error);
        }
        
        if (throwOnError) throw error;
        return null;
      }
    },
    [asyncFunction, onSuccess, onError, throwOnError]
  );

  const reset = useCallback(() => {
    setStatus({ isLoading: false, error: null, data: null });
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setStatus(prev => ({
      ...prev,
      isLoading,
      ...(isLoading ? { error: null } : {}),
    }));
  }, []);

  const setError = useCallback((error: Error | null) => {
    setStatus(prev => ({ ...prev, error, isLoading: false }));
  }, []);

  const setData = useCallback((data: T | null) => {
    setStatus(prev => ({ ...prev, data, error: null, isLoading: false }));
  }, []);

  return {
    ...status,
    isError: !!status.error,
    isSuccess: !status.error && !status.isLoading && status.data !== null,
    isIdle: !status.isLoading && !status.error && status.data === null,
    execute,
    reset,
    setLoading,
    setError,
    setData,
    loading: status.isLoading,
  };
};

export default useAsync;
