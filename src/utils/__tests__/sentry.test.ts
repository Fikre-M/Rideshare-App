import { 
  initSentry, 
  setUserContext, 
  clearUserContext, 
  addBreadcrumb, 
  trackEvent, 
  trackAICommand, 
  trackApiError, 
  trackPerformance,
  handleUnhandledError,
  handleUnhandledRejection,
  isSentryAvailable
} from '../../utils/sentry';

// Mock Sentry
jest.mock('@sentry/react', () => ({
  init: jest.fn(),
  setUser: jest.fn(),
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
  reactRouterV6Instrumentation: jest.fn(),
}));

// Mock import.meta.env
const originalEnv = import.meta.env;

describe('Sentry Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock import.meta.env
    (import.meta.env as any) = {
      VITE_SENTRY_DSN: '',
      MODE: 'test',
      VITE_APP_VERSION: '1.0.0',
    };
  });

  afterEach(() => {
    // Restore original env
    (import.meta.env as any) = originalEnv;
  });

  describe('initSentry', () => {
    it('should not initialize Sentry when no DSN provided', () => {
      const Sentry = require('@sentry/react');
      
      initSentry();
      
      expect(Sentry.init).not.toHaveBeenCalled();
    });

    it('should initialize Sentry when DSN is provided', () => {
      const Sentry = require('@sentry/react');
      (import.meta.env as any).VITE_SENTRY_DSN = 'https://test@sentry.io/123';
      
      initSentry();
      
      expect(Sentry.init).toHaveBeenCalledWith({
        dsn: 'https://test@sentry.io/123',
        environment: 'test',
        debug: true,
        release: 'ai-rideshare-platform@1.0.0',
        integrations: expect.any(Array),
        tracesSampleRate: 0.0,
        beforeSend: expect.any(Function),
        initialScope: expect.any(Object),
        ignoreErrors: expect.any(Array),
        denyUrls: expect.any(Array),
      });
    });
  });

  describe('isSentryAvailable', () => {
    it('should return false when no DSN is provided', () => {
      expect(isSentryAvailable()).toBe(false);
    });

    it('should return true when DSN is provided', () => {
      (import.meta.env as any).VITE_SENTRY_DSN = 'https://test@sentry.io/123';
      expect(isSentryAvailable()).toBe(true);
    });
  });

  describe('setUserContext', () => {
    it('should set user context when Sentry is available', () => {
      const Sentry = require('@sentry/react');
      (import.meta.env as any).VITE_SENTRY_DSN = 'https://test@sentry.io/123';
      
      const user = { id: '123', email: 'test@example.com', name: 'Test User' };
      setUserContext(user);
      
      expect(Sentry.setUser).toHaveBeenCalledWith(user);
    });

    it('should not set user context when Sentry is not available', () => {
      const Sentry = require('@sentry/react');
      
      setUserContext({ id: '123' });
      
      expect(Sentry.setUser).not.toHaveBeenCalled();
    });
  });

  describe('clearUserContext', () => {
    it('should clear user context when Sentry is available', () => {
      const Sentry = require('@sentry/react');
      (import.meta.env as any).VITE_SENTRY_DSN = 'https://test@sentry.io/123';
      
      clearUserContext();
      
      expect(Sentry.setUser).toHaveBeenCalledWith(null);
    });
  });

  describe('addBreadcrumb', () => {
    it('should add breadcrumb when Sentry is available', () => {
      const Sentry = require('@sentry/react');
      (import.meta.env as any).VITE_SENTRY_DSN = 'https://test@sentry.io/123';
      
      const breadcrumb = {
        message: 'Test breadcrumb',
        category: 'test',
        level: 'info' as const,
        data: { test: true },
      };
      
      addBreadcrumb(breadcrumb);
      
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        timestamp: expect.any(Number),
        type: 'default',
        ...breadcrumb,
      });
    });
  });

  describe('trackEvent', () => {
    it('should add breadcrumb for event when Sentry is available', () => {
      const Sentry = require('@sentry/react');
      (import.meta.env as any).VITE_SENTRY_DSN = 'https://test@sentry.io/123';
      
      trackEvent('test_event', { data: 'test' });
      
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'test_event',
        category: 'custom.event',
        level: 'info',
        data: { data: 'test' },
        timestamp: expect.any(Number),
        type: 'default',
      });
    });
  });

  describe('trackAICommand', () => {
    it('should track successful AI command', () => {
      const Sentry = require('@sentry/react');
      (import.meta.env as any).VITE_SENTRY_DSN = 'https://test@sentry.io/123';
      
      trackAICommand('smart-matching', true);
      
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'ai_command_executed',
        category: 'custom.event',
        level: 'info',
        data: {
          command: 'smart-matching',
          success: true,
          error: undefined,
          timestamp: expect.any(String),
        },
        timestamp: expect.any(Number),
        type: 'default',
      });
    });

    it('should track failed AI command with error', () => {
      const Sentry = require('@sentry/react');
      (import.meta.env as any).VITE_SENTRY_DSN = 'https://test@sentry.io/123';
      
      trackAICommand('smart-matching', false, 'API Error');
      
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'ai_command_executed',
        category: 'custom.event',
        level: 'info',
        data: {
          command: 'smart-matching',
          success: false,
          error: 'API Error',
          timestamp: expect.any(String),
        },
        timestamp: expect.any(Number),
        type: 'default',
      });
    });
  });

  describe('trackApiError', () => {
    it('should track API error', () => {
      const Sentry = require('@sentry/react');
      (import.meta.env as any).VITE_SENTRY_DSN = 'https://test@sentry.io/123';
      
      const error = new Error('API failed');
      trackApiError('/api/test', error, 500);
      
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'API Error: /api/test',
        category: 'api.error',
        level: 'error',
        data: {
          endpoint: '/api/test',
          error: 'API failed',
          statusCode: 500,
          timestamp: expect.any(String),
        },
        timestamp: expect.any(Number),
        type: 'default',
      });
    });
  });

  describe('trackPerformance', () => {
    it('should track performance metric', () => {
      const Sentry = require('@sentry/react');
      (import.meta.env as any).VITE_SENTRY_DSN = 'https://test@sentry.io/123';
      
      trackPerformance('load_time', 1500, 'ms');
      
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'performance_metric',
        category: 'custom.event',
        level: 'info',
        data: {
          metric: 'load_time',
          value: 1500,
          unit: 'ms',
          timestamp: expect.any(String),
        },
        timestamp: expect.any(Number),
        type: 'default',
      });
    });
  });

  describe('handleUnhandledError', () => {
    it('should capture exception when Sentry is available', () => {
      const Sentry = require('@sentry/react');
      (import.meta.env as any).VITE_SENTRY_DSN = 'https://test@sentry.io/123';
      
      const error = new Error('Test error');
      const errorInfo = { componentStack: 'Test stack' };
      
      handleUnhandledError(error, errorInfo);
      
      expect(Sentry.captureException).toHaveBeenCalledWith(error, {
        contexts: {
          react: {
            componentStack: 'Test stack',
          },
        },
      });
    });
  });

  describe('handleUnhandledRejection', () => {
    it('should capture promise rejection when Sentry is available', () => {
      const Sentry = require('@sentry/react');
      (import.meta.env as any).VITE_SENTRY_DSN = 'https://test@sentry.io/123';
      
      const rejection = new Error('Promise rejected');
      const event = { reason: rejection } as PromiseRejectionEvent;
      
      handleUnhandledRejection(event);
      
      expect(Sentry.captureException).toHaveBeenCalledWith(rejection, {
        tags: {
          type: 'unhandled_promise_rejection',
        },
      });
    });
  });
});
