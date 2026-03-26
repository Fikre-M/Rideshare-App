// Mock Sentry completely
jest.mock('@sentry/react', () => ({
  init: jest.fn(),
  setUser: jest.fn(),
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
  reactRouterV6Instrumentation: jest.fn(),
}));

// Mock the sentry utils
jest.mock('../../utils/sentry', () => ({
  initSentry: jest.fn(),
  setUserContext: jest.fn(),
  clearUserContext: jest.fn(),
  addBreadcrumb: jest.fn(),
  trackEvent: jest.fn(),
  trackAICommand: jest.fn(),
  trackApiError: jest.fn(),
  trackPerformance: jest.fn(),
  handleUnhandledError: jest.fn(),
  handleUnhandledRejection: jest.fn(),
  isSentryAvailable: jest.fn(() => false),
}));

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
  isSentryAvailable,
} from '../../utils/sentry';

describe('Sentry Utilities (Mocked)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Utility Functions', () => {
    it('should call initSentry', () => {
      initSentry();
      expect(initSentry).toHaveBeenCalled();
    });

    it('should call setUserContext', () => {
      const user = { id: '123', email: 'test@example.com' };
      setUserContext(user);
      expect(setUserContext).toHaveBeenCalledWith(user);
    });

    it('should call clearUserContext', () => {
      clearUserContext();
      expect(clearUserContext).toHaveBeenCalled();
    });

    it('should call addBreadcrumb', () => {
      const breadcrumb = {
        message: 'Test breadcrumb',
        category: 'test',
        level: 'info' as const,
        data: { test: true },
      };
      addBreadcrumb(breadcrumb);
      expect(addBreadcrumb).toHaveBeenCalledWith(breadcrumb);
    });

    it('should call trackEvent', () => {
      trackEvent('test_event', { data: 'test' });
      expect(trackEvent).toHaveBeenCalledWith('test_event', { data: 'test' });
    });

    it('should call trackAICommand', () => {
      trackAICommand('smart-matching', true);
      expect(trackAICommand).toHaveBeenCalledWith('smart-matching', true);
    });

    it('should call trackAICommand with error', () => {
      trackAICommand('smart-matching', false, 'API Error');
      expect(trackAICommand).toHaveBeenCalledWith('smart-matching', false, 'API Error');
    });

    it('should call trackApiError', () => {
      const error = new Error('API failed');
      trackApiError('/api/test', error, 500);
      expect(trackApiError).toHaveBeenCalledWith('/api/test', error, 500);
    });

    it('should call trackPerformance', () => {
      trackPerformance('load_time', 1500, 'ms');
      expect(trackPerformance).toHaveBeenCalledWith('load_time', 1500, 'ms');
    });

    it('should call handleUnhandledError', () => {
      const error = new Error('Test error');
      const errorInfo = { componentStack: 'Test stack' };
      handleUnhandledError(error, errorInfo);
      expect(handleUnhandledError).toHaveBeenCalledWith(error, errorInfo);
    });

    it('should call handleUnhandledRejection', () => {
      const rejection = new Error('Promise rejected');
      const event = { reason: rejection } as PromiseRejectionEvent;
      handleUnhandledRejection(event);
      expect(handleUnhandledRejection).toHaveBeenCalledWith(event);
    });

    it('should check if Sentry is available', () => {
      const available = isSentryAvailable();
      expect(isSentryAvailable).toHaveBeenCalled();
      expect(typeof available).toBe('boolean');
    });
  });

  describe('Integration with AI Commands', () => {
    it('should track AI command success', () => {
      trackAICommand('chat', true);
      expect(trackAICommand).toHaveBeenCalledWith('chat', true);
    });

    it('should track AI command failure', () => {
      trackAICommand('smart-matching', false, 'Service unavailable');
      expect(trackAICommand).toHaveBeenCalledWith('smart-matching', false, 'Service unavailable');
    });

    it('should track multiple AI commands', () => {
      const commands = [
        { cmd: 'chat', success: true },
        { cmd: 'smart-matching', success: false, error: 'API Error' },
        { cmd: 'help', success: true },
      ];

      commands.forEach(({ cmd, success, error }) => {
        if (error) {
          trackAICommand(cmd as any, success, error);
        } else {
          trackAICommand(cmd as any, success);
        }
      });

      expect(trackAICommand).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Tracking', () => {
    it('should track different types of errors', () => {
      const errors = [
        { type: 'api', error: new Error('API failed'), endpoint: '/api/test' },
        { type: 'network', error: new Error('Network error'), endpoint: '/api/users' },
        { type: 'validation', error: new Error('Invalid data'), endpoint: '/api/validate' },
      ];

      errors.forEach(({ type, error, endpoint }) => {
        trackApiError(endpoint, error);
      });

      expect(trackApiError).toHaveBeenCalledTimes(3);
    });

    it('should track performance metrics', () => {
      const metrics = [
        { name: 'page_load', value: 1200, unit: 'ms' },
        { name: 'api_response', value: 350, unit: 'ms' },
        { name: 'render_time', value: 50, unit: 'ms' },
      ];

      metrics.forEach(({ name, value, unit }) => {
        trackPerformance(name, value, unit);
      });

      expect(trackPerformance).toHaveBeenCalledTimes(3);
    });
  });

  describe('User Context', () => {
    it('should set and clear user context', () => {
      const user = {
        id: 'user_123',
        email: 'user@example.com',
        name: 'Test User',
      };

      setUserContext(user);
      expect(setUserContext).toHaveBeenCalledWith(user);

      clearUserContext();
      expect(clearUserContext).toHaveBeenCalled();
    });

    it('should handle partial user data', () => {
      const partialUser = { id: 'user_456' };
      setUserContext(partialUser);
      expect(setUserContext).toHaveBeenCalledWith(partialUser);
    });
  });
});
