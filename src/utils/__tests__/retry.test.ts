import { 
  retryWithBackoff, 
  CircuitBreaker, 
  RetryQueue
} from '../../utils/retry';

// Mock setTimeout for testing
jest.useFakeTimers();

describe('Retry Logic Utilities', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  describe('retryWithBackoff', () => {
    it('should succeed on first attempt', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      
      const result = await retryWithBackoff(mockFn);
      
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(1);
      expect(result.totalDelay).toBe(0);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable errors', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Rate limit'))
        .mockResolvedValue('success');

      const retryOptions = {
        maxRetries: 3,
        baseDelay: 100,
        maxDelay: 1000,
        retryCondition: (error: any) => error.message.includes('Network') || error.message.includes('Rate limit'),
      };

      const promise = retryWithBackoff(mockFn, retryOptions);
      
      // Fast forward through delays
      jest.advanceTimersByTime(100);
      jest.advanceTimersByTime(200);
      
      const result = await promise;
      
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(3);
      expect(result.totalDelay).toBeGreaterThan(0);
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Persistent error'));
      
      const retryOptions = {
        maxRetries: 2,
        baseDelay: 100,
        maxDelay: 1000,
      };

      const promise = retryWithBackoff(mockFn, retryOptions);
      
      // Fast forward through delays
      jest.advanceTimersByTime(100);
      jest.advanceTimersByTime(200);
      
      await expect(promise).rejects.toThrow('Persistent error');
      expect(mockFn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
    });

    it('should not retry on non-retryable errors', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Validation error'));
      
      const retryOptions = {
        maxRetries: 3,
        retryCondition: (error: any) => error.message.includes('Network'),
      };

      await expect(retryWithBackoff(mockFn, retryOptions)).rejects.toThrow('Validation error');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('CircuitBreaker', () => {
    it('should execute function successfully', async () => {
      const circuitBreaker = new CircuitBreaker({
        threshold: 3,
        timeout: 60000,
        resetTimeout: 300000,
      });

      const mockFn = jest.fn().mockResolvedValue('success');
      
      const result = await circuitBreaker.execute(mockFn);
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should open circuit after threshold failures', async () => {
      const circuitBreaker = new CircuitBreaker({
        threshold: 2,
        timeout: 60000,
        resetTimeout: 300000,
      });

      const mockFn = jest.fn().mockRejectedValue(new Error('Service error'));
      
      // Fail twice to open circuit
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('Service error');
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('Service error');
      
      // Circuit should now be open
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('Circuit breaker is OPEN');
      
      const state = circuitBreaker.getState();
      expect(state.state).toBe('OPEN');
      expect(state.failures).toBe(2);
    });

    it('should reset circuit after timeout', async () => {
      const circuitBreaker = new CircuitBreaker({
        threshold: 2,
        timeout: 60000,
        resetTimeout: 1000, // 1 second for testing
      });

      const mockFn = jest.fn().mockRejectedValue(new Error('Service error'));
      
      // Fail twice to open circuit
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('Service error');
      await expect(circuitBreaker.execute(mockFn)).rejects.toThrow('Service error');
      
      // Fast forward past reset timeout
      jest.advanceTimersByTime(1001);
      
      // Circuit should be half-open now
      const successFn = jest.fn().mockResolvedValue('success');
      const result = await circuitBreaker.execute(successFn);
      
      expect(result).toBe('success');
      
      const state = circuitBreaker.getState();
      expect(state.state).toBe('CLOSED');
      expect(state.failures).toBe(0);
    });
  });

  describe('RetryQueue', () => {
    it('should process queued items', async () => {
      const queue = new RetryQueue(5);
      
      const mockFn1 = jest.fn().mockResolvedValue('result1');
      const mockFn2 = jest.fn().mockResolvedValue('result2');
      
      const promise1 = queue.add(mockFn1);
      const promise2 = queue.add(mockFn2);
      
      const [result1, result2] = await Promise.all([promise1, promise2]);
      
      expect(result1).toBe('result1');
      expect(result2).toBe('result2');
      expect(mockFn1).toHaveBeenCalledTimes(1);
      expect(mockFn2).toHaveBeenCalledTimes(1);
    });

    it('should reject when queue is full', async () => {
      const queue = new RetryQueue(2);
      
      const mockFn = jest.fn().mockResolvedValue('success');
      
      // Fill queue
      queue.add(mockFn);
      queue.add(mockFn);
      
      // Should reject when full
      await expect(queue.add(mockFn)).rejects.toThrow('Retry queue is full');
    });

    it('should clear queue and reject all pending items', async () => {
      const queue = new RetryQueue(5);
      
      const mockFn = jest.fn().mockResolvedValue('success');
      
      const promise1 = queue.add(mockFn);
      const promise2 = queue.add(mockFn);
      
      queue.clear();
      
      await expect(promise1).rejects.toThrow('Retry queue cleared');
      await expect(promise2).rejects.toThrow('Retry queue cleared');
      
      expect(queue.getQueueSize()).toBe(0);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complex retry scenarios', async () => {
      const circuitBreaker = new CircuitBreaker({
        threshold: 3,
        timeout: 60000,
        resetTimeout: 300000,
      });

      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Rate limit'))
        .mockResolvedValue('success');

      const retryOptions = {
        maxRetries: 3,
        baseDelay: 100,
        maxDelay: 1000,
      };

      const promise = circuitBreaker.execute(async () => {
        const result = await retryWithBackoff(mockFn, retryOptions);
        return result.data;
      });
      
      // Fast forward through delays
      jest.advanceTimersByTime(100);
      jest.advanceTimersByTime(200);
      
      const result = await promise;
      
      expect(result).toBe('success');
      expect(circuitBreaker.getState().state).toBe('CLOSED');
    });
  });
});
