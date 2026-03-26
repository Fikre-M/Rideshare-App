/**
 * Retry Logic Utilities
 * Implements exponential backoff and retry strategies for API calls
 */

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: any) => boolean;
  onRetry?: (attempt: number, error: any) => void;
}

export interface RetryResult<T> {
  data: T;
  attempts: number;
  totalDelay: number;
}

/**
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffFactor: 2,
  retryCondition: (error: any) => {
    // Retry on network errors and 5xx server errors
    if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
      return true;
    }
    if (error.response?.status >= 500 || error.response?.status === 429) {
      return true;
    }
    // Retry on rate limit errors
    if (error.message?.toLowerCase().includes('rate limit')) {
      return true;
    }
    return false;
  },
  onRetry: () => {},
};

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(attempt: number, baseDelay: number, maxDelay: number, backoffFactor: number): number {
  const exponentialDelay = baseDelay * Math.pow(backoffFactor, attempt - 1);
  const jitter = Math.random() * 0.1 * exponentialDelay; // Add 10% jitter
  const delay = exponentialDelay + jitter;
  return Math.min(delay, maxDelay);
}

/**
 * Sleep function for delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: any;
  let totalDelay = 0;

  for (let attempt = 1; attempt <= opts.maxRetries + 1; attempt++) {
    try {
      const startTime = Date.now();
      const data = await fn();
      const duration = Date.now() - startTime;
      
      return {
        data,
        attempts: attempt,
        totalDelay,
      };
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on the last attempt or if error doesn't meet retry condition
      if (attempt > opts.maxRetries || !opts.retryCondition(error)) {
        throw error;
      }

      // Calculate delay for next attempt
      const delay = calculateDelay(attempt, opts.baseDelay, opts.maxDelay, opts.backoffFactor);
      totalDelay += delay;

      // Call retry callback
      opts.onRetry(attempt, error);

      // Wait before retrying
      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}

/**
 * Retry decorator for class methods
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return (async (...args: Parameters<T>) => {
    return retryWithBackoff(() => fn(...args), options);
  }) as T;
}

/**
 * Create a retry-aware API wrapper
 */
export function createRetryableAPI<T extends Record<string, (...args: any[]) => Promise<any>>>(
  api: T,
  defaultOptions: RetryOptions = {}
): T {
  const wrappedAPI = {} as T;
  
  for (const [key, value] of Object.entries(api)) {
    if (typeof value === 'function') {
      wrappedAPI[key as keyof T] = withRetry(value, defaultOptions) as T[keyof T];
    }
  }
  
  return wrappedAPI;
}

/**
 * Circuit breaker pattern for API calls
 */
export class CircuitBreaker<T> {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private options: {
      threshold: number;
      timeout: number;
      resetTimeout: number;
    }
  ) {}

  async execute(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.options.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.options.threshold) {
      this.state = 'OPEN';
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

/**
 * Retry queue for batching failed requests
 */
export class RetryQueue {
  private queue: Array<{
    fn: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
    options: RetryOptions;
    timestamp: number;
  }> = [];
  private processing = false;

  constructor(private maxQueueSize = 100) {}

  async add<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (this.queue.length >= this.maxQueueSize) {
        reject(new Error('Retry queue is full'));
        return;
      }

      this.queue.push({
        fn,
        resolve,
        reject,
        options,
        timestamp: Date.now(),
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift()!;
      
      try {
        const result = await retryWithBackoff(item.fn, item.options);
        item.resolve(result.data);
      } catch (error) {
        item.reject(error);
      }
    }

    this.processing = false;
  }

  getQueueSize() {
    return this.queue.length;
  }

  clear() {
    this.queue.forEach(item => {
      item.reject(new Error('Retry queue cleared'));
    });
    this.queue = [];
  }
}

export default {
  retryWithBackoff,
  withRetry,
  createRetryableAPI,
  CircuitBreaker,
  RetryQueue,
  calculateDelay,
};
