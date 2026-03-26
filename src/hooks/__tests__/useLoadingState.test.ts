import { renderHook, act, waitFor } from '@testing-library/react';
import { useLoadingState } from '../../hooks/useLoadingState';

// Mock setTimeout for testing
jest.useFakeTimers();

describe('useLoadingState Hook', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useLoadingState());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.attempt).toBe(0);
    expect(result.current.maxRetries).toBe(3);
    expect(result.current.error).toBe(null);
    expect(result.current.lastSuccess).toBe(null);
    expect(result.current.canRetry).toBe(true);
    expect(result.current.progress).toBe(0);
  });

  it('should handle successful operation', async () => {
    const mockOperation = jest.fn().mockResolvedValue('success');
    const onSuccess = jest.fn();
    const onError = jest.fn();

    const { result } = renderHook(() => useLoadingState({
      maxRetries: 2,
      onSuccess,
      onError,
    }));

    let operationResult: string;
    
    await act(async () => {
      operationResult = await result.current.execute(mockOperation);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.attempt).toBe(0);
    expect(result.current.error).toBe(null);
    expect(result.current.lastSuccess).toBe('success');
    expect(operationResult).toBe('success');
    expect(onSuccess).toHaveBeenCalledWith('success');
    expect(onError).not.toHaveBeenCalled();
  });

  it('should handle operation failure without retry', async () => {
    const mockOperation = jest.fn().mockRejectedValue(new Error('Test error'));
    const onSuccess = jest.fn();
    const onError = jest.fn();

    const { result } = renderHook(() => useLoadingState({
      onSuccess,
      onError,
    }));

    await act(async () => {
      await expect(result.current.execute(mockOperation)).rejects.toThrow('Test error');
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.attempt).toBe(0);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Test error');
    expect(result.current.lastSuccess).toBe(null);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
  });

  it('should retry on retryable errors', async () => {
    const mockOperation = jest.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Rate limit'))
      .mockResolvedValue('success');
    
    const onSuccess = jest.fn();
    const onError = jest.fn();

    const { result } = renderHook(() => useLoadingState({
      maxRetries: 3,
      retryDelay: 1000,
      onSuccess,
      onError,
    }));

    let operationResult: string;

    await act(async () => {
      operationResult = await result.current.execute(
        mockOperation,
        (error) => error.message.includes('Network') || error.message.includes('Rate limit')
      );
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.attempt).toBe(0);
    expect(result.current.lastSuccess).toBe('success');
    expect(operationResult).toBe('success');
    expect(onSuccess).toHaveBeenCalledWith('success');
    expect(mockOperation).toHaveBeenCalledTimes(3);
  });

  it('should fail after max retries', async () => {
    const mockOperation = jest.fn().mockRejectedValue(new Error('Persistent error'));
    const onSuccess = jest.fn();
    const onError = jest.fn();

    const { result } = renderHook(() => useLoadingState({
      maxRetries: 2,
      retryDelay: 500,
      onSuccess,
      onError,
    }));

    await act(async () => {
      await expect(result.current.execute(
        mockOperation,
        (error) => error.message.includes('Persistent')
      )).rejects.toThrow('Persistent error');
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.attempt).toBe(0); // Reset on final failure
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Persistent error');
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
    expect(mockOperation).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });

  it('should not retry non-retryable errors', async () => {
    const mockOperation = jest.fn().mockRejectedValue(new Error('Validation error'));
    const onSuccess = jest.fn();
    const onError = jest.fn();

    const { result } = renderHook(() => useLoadingState({
      maxRetries: 3,
      onSuccess,
      onError,
    }));

    await act(async () => {
      await expect(result.current.execute(
        mockOperation,
        (error) => error.message.includes('Network') // Only retry network errors
      )).rejects.toThrow('Validation error');
    });

    expect(mockOperation).toHaveBeenCalledTimes(1); // No retries
    expect(result.current.attempt).toBe(0);
  });

  it('should handle manual loading state control', () => {
    const { result } = renderHook(() => useLoadingState());

    act(() => {
      result.current.startLoading();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isRetrying).toBe(false);

    act(() => {
      result.current.stopLoading(true, 'test data');
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.lastSuccess).toBe('test data');
  });

  it('should handle retry attempts', () => {
    const { result } = renderHook(() => useLoadingState({ maxRetries: 2 }));

    act(() => {
      result.current.startLoading();
    });

    act(() => {
      result.current.incrementAttempt();
    });

    expect(result.current.attempt).toBe(1);
    expect(result.current.isRetrying).toBe(true);
    expect(result.current.canRetry).toBe(true);

    act(() => {
      result.current.incrementAttempt();
    });

    expect(result.current.attempt).toBe(2);
    expect(result.current.canRetry).toBe(true);

    act(() => {
      result.current.incrementAttempt();
    });

    expect(result.current.attempt).toBe(3);
    expect(result.current.canRetry).toBe(false);
  });

  it('should reset state', () => {
    const { result } = renderHook(() => useLoadingState({ maxRetries: 2 }));

    act(() => {
      result.current.startLoading();
      result.current.incrementAttempt();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.attempt).toBe(1);

    act(() => {
      result.current.reset();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.attempt).toBe(0);
    expect(result.current.error).toBe(null);
    expect(result.current.lastSuccess).toBe(null);
  });

  it('should calculate progress correctly', () => {
    const { result } = renderHook(() => useLoadingState({ maxRetries: 4 }));

    expect(result.current.progress).toBe(0);

    act(() => {
      result.current.incrementAttempt();
    });

    expect(result.current.progress).toBe(25); // 1/4 * 100

    act(() => {
      result.current.incrementAttempt();
    });

    expect(result.current.progress).toBe(50); // 2/4 * 100

    act(() => {
      result.current.incrementAttempt();
    });

    expect(result.current.progress).toBe(75); // 3/4 * 100
  });

  it('should call onRetry callback during retries', async () => {
    const mockOperation = jest.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue('success');
    
    const onRetry = jest.fn();

    const { result } = renderHook(() => useLoadingState({
      maxRetries: 2,
      retryDelay: 100,
      onRetry,
    }));

    await act(async () => {
      await result.current.execute(
        mockOperation,
        (error) => error.message.includes('Network')
      );
    });

    expect(onRetry).toHaveBeenCalledWith(1);
  });

  it('should handle operation cancellation', async () => {
    const mockOperation = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve('success'), 1000))
    );

    const { result } = renderHook(() => useLoadingState());

    let operationPromise: Promise<string>;

    act(() => {
      operationPromise = result.current.execute(mockOperation);
    });

    expect(result.current.isLoading).toBe(true);

    // Cancel the operation
    act(() => {
      result.current.reset();
    });

    await expect(operationPromise).rejects.toThrow('Operation cancelled');
    expect(result.current.isLoading).toBe(false);
  });
});
