// @ts-nocheck
import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook to handle async operations with loading and error states
 * @param {Function} asyncFunction - The async function to execute
 * @param {Object} options - Configuration options
 * @param {boolean} [options.initialLoading=false] - Initial loading state
 * @param {Function} [options.onSuccess] - Callback on successful execution
 * @param {Function} [options.onError] - Callback on error
 * @param {boolean} [options.throwOnError=false] - Whether to throw errors or return them
 * @returns {Object} - Async state and controls
 */
const useAsync = (asyncFunction, options = {}) => {
  const {
    initialLoading = false,
    onSuccess,
    onError,
    throwOnError = false,
  } = options;

  const [status, setStatus] = useState({
    isLoading: initialLoading,
    error: null,
    data: null,
  });

  const isMounted = useRef(true);
  const lastCallId = useRef(0);

  // Set isMounted to false when the component unmounts
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  /**
   * Execute the async function with the provided arguments
   * @param {...any} args - Arguments to pass to the async function
   * @returns {Promise<any>} - The result of the async function
   */
  const execute = useCallback(
    async (...args) => {
      if (!asyncFunction) return null;

      const callId = ++lastCallId.current;
      
      try {
        setStatus(prev => ({ ...prev, isLoading: true, error: null }));
        
        const result = await asyncFunction(...args);
        
        // Only update state if this is the most recent call and component is still mounted
        if (isMounted.current && callId === lastCallId.current) {
          setStatus({
            isLoading: false,
            error: null,
            data: result,
          });
          
          if (onSuccess) {
            onSuccess(result);
          }
        }
        
        return result;
      } catch (error) {
        console.error('useAsync error:', error);
        
        // Only update state if this is the most recent call and component is still mounted
        if (isMounted.current && callId === lastCallId.current) {
          setStatus(prev => ({
            ...prev,
            isLoading: false,
            error,
          }));
          
          if (onError) {
            onError(error);
          }
        }
        
        if (throwOnError) {
          throw error;
        }
        
        return null;
      }
    },
    [asyncFunction, onSuccess, onError, throwOnError]
  );

  /**
   * Reset the async state to initial values
   */
  const reset = useCallback(() => {
    setStatus({
      isLoading: false,
      error: null,
      data: null,
    });
  }, []);

  /**
   * Set the loading state manually
   * @param {boolean} isLoading - Whether the async operation is in progress
   */
  const setLoading = useCallback((isLoading) => {
    setStatus(prev => ({
      ...prev,
      isLoading,
      ...(isLoading ? { error: null } : {}),
    }));
  }, []);

  /**
   * Set the error state manually
   * @param {Error|null} error - The error to set, or null to clear the error
   */
  const setError = useCallback((error) => {
    setStatus(prev => ({
      ...prev,
      error,
      isLoading: false,
    }));
  }, []);

  /**
   * Set the data state manually
   * @param {any} data - The data to set
   */
  const setData = useCallback((data) => {
    setStatus(prev => ({
      ...prev,
      data,
      error: null,
      isLoading: false,
    }));
  }, []);

  return {
    // State
    ...status,
    
    // Aliases for convenience
    isError: !!status.error,
    isSuccess: !status.error && !status.isLoading && status.data !== null,
    isIdle: !status.isLoading && !status.error && status.data === null,
    
    // Actions
    execute,
    reset,
    setLoading,
    setError,
    setData,
    
    // For controlled components
    loading: status.isLoading,
  };
};

export default useAsync;

/**
 * Example usage:
 * 
 * const {
 *   // State
 *   data,
 *   error,
 *   isLoading,
 *   isError,
 *   isSuccess,
 *   isIdle,
 *   
 *   // Actions
 *   execute: fetchData,
 *   reset,
 *   setData,
 *   setError,
 *   setLoading,
 * } = useAsync(
 *   async (params) => {
 *     const response = await api.fetchData(params);
 *     return response.data;
 *   },
 *   {
 *     initialLoading: false,
 *     onSuccess: (data) => console.log('Success:', data),
 *     onError: (error) => console.error('Error:', error),
 *     throwOnError: false,
 *   }
 * );
 * 
 * // In component:
 * useEffect(() => {
 *   fetchData({ id: 1 });
 * }, [fetchData]);
 */
