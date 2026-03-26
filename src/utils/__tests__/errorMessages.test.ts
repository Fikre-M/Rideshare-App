import {
  createUserFriendlyError,
  formatErrorForDisplay,
  getErrorIcon,
  getErrorColor,
  generateErrorBoundaryMessage,
  generateApiErrorMessage,
  generateAiErrorMessage,
} from '../../utils/errorMessages';

describe('Error Message Utilities', () => {
  describe('createUserFriendlyError', () => {
    it('should handle network errors', () => {
      const error = new Error('Network error: Connection refused');
      const result = createUserFriendlyError(error);
      
      expect(result.title).toBe('Connection Problem');
      expect(result.message).toContain('internet connection');
      expect(result.retryPossible).toBe(true);
      expect(result.severity.level).toBe('info');
    });

    it('should handle API errors', () => {
      const error = new Error('API error: Server responded with status 500');
      const result = createUserFriendlyError(error);
      
      expect(result.title).toBe('Service Unavailable');
      expect(result.message).toContain('servers are experiencing issues');
      expect(result.retryPossible).toBe(true);
      expect(result.severity.level).toBe('error');
    });

    it('should handle authentication errors', () => {
      const error = new Error('Authentication failed: Unauthorized');
      const result = createUserFriendlyError(error);
      
      expect(result.title).toBe('Authentication Required');
      expect(result.message).toContain('logged in');
      expect(result.retryPossible).toBe(false);
      expect(result.severity.level).toBe('error');
    });

    it('should handle validation errors', () => {
      const error = new Error('Validation error: Email is required');
      const result = createUserFriendlyError(error);
      
      expect(result.title).toBe('Invalid Input');
      expect(result.message).toContain('check your input');
      expect(result.retryPossible).toBe(false);
      expect(result.severity.level).toBe('warning');
    });

    it('should handle rate limit errors', () => {
      const error = new Error('Rate limit exceeded: Too many requests');
      const result = createUserFriendlyError(error);
      
      expect(result.title).toBe('Too Many Requests');
      expect(result.message).toContain('too many requests');
      expect(result.retryPossible).toBe(true);
      expect(result.severity.level).toBe('warning');
    });

    it('should handle AI service errors', () => {
      const error = new Error('AI service error: OpenAI API failed');
      const result = createUserFriendlyError(error);
      
      expect(result.title).toBe('AI Service Unavailable');
      expect(result.message).toContain('AI assistant');
      expect(result.retryPossible).toBe(true);
      expect(result.contactSupport).toBe(true);
    });

    it('should extract error codes', () => {
      const error = new Error('Request failed with status [404]');
      const result = createUserFriendlyError(error);
      
      expect(result.errorCode).toBe('404');
    });

    it('should use context information', () => {
      const error = new Error('Something went wrong');
      const context = {
        operation: 'saving your data',
        component: 'DataForm',
        userAction: 'submit the form',
      };
      
      const result = createUserFriendlyError(error, context);
      
      expect(result.title).toBe('Something Went Wrong - DataForm');
      expect(result.message).toContain('saving your data');
      expect(result.suggestions).toContain('Try submit the form again');
    });

    it('should handle unknown errors', () => {
      const error = new Error('Unknown error occurred');
      const result = createUserFriendlyError(error);
      
      expect(result.title).toBe('Something Went Wrong');
      expect(result.message).toContain('unexpected error');
      expect(result.retryPossible).toBe(true);
      expect(result.severity.level).toBe('error');
    });
  });

  describe('formatErrorForDisplay', () => {
    it('should format error for display', () => {
      const error = {
        title: 'Test Error',
        message: 'Something went wrong',
        suggestions: ['Try again', 'Check connection'],
        severity: { level: 'error' as const, userFriendly: true, actionable: true },
        retryPossible: true,
        contactSupport: false,
      };
      
      const result = formatErrorForDisplay(error);
      
      expect(result.title).toBe('Test Error');
      expect(result.message).toBe('Something went wrong');
      expect(result.actions).toHaveLength(2);
      expect(result.actions[0].action).toBe('retry');
      expect(result.actions[0].primary).toBe(true);
      expect(result.actions[1].action).toBe('refresh');
      expect(result.showTechnicalDetails).toBe(false);
    });

    it('should include contact action for critical errors', () => {
      const error = {
        title: 'Critical Error',
        message: 'System failure',
        suggestions: ['Contact support'],
        severity: { level: 'error' as const, userFriendly: true, actionable: true },
        retryPossible: false,
        contactSupport: true,
      };
      
      const result = formatErrorForDisplay(error);
      
      expect(result.actions).toHaveLength(2);
      expect(result.actions[0].action).toBe('refresh');
      expect(result.actions[1].action).toBe('contact');
    });
  });

  describe('getErrorIcon', () => {
    it('should return correct icons for each severity', () => {
      expect(getErrorIcon('info')).toBe('🔍');
      expect(getErrorIcon('warning')).toBe('⚠️');
      expect(getErrorIcon('error')).toBe('❌');
      expect(getErrorIcon('critical')).toBe('🚨');
    });
  });

  describe('getErrorColor', () => {
    it('should return correct colors for each severity', () => {
      expect(getErrorColor('info')).toBe('#2196F3');
      expect(getErrorColor('warning')).toBe('#FF9800');
      expect(getErrorColor('error')).toBe('#F44336');
      expect(getErrorColor('critical')).toBe('#D32F2F');
    });
  });

  describe('generateErrorBoundaryMessage', () => {
    it('should generate error boundary message', () => {
      const error = new Error('Component crashed');
      const errorInfo = {
        componentStack: 'at Component\n  at App',
      };
      
      const result = generateErrorBoundaryMessage(error, errorInfo);
      
      expect(result.title).toBe('Something went wrong');
      expect(result.message).toContain('rendering the page');
      expect(result.component).toBe('React component');
      expect(result.additionalInfo?.componentStack).toBe(errorInfo.componentStack);
      expect(result.retryPossible).toBe(true);
    });
  });

  describe('generateApiErrorMessage', () => {
    it('should generate API error message', () => {
      const error = new Error('Request failed');
      const result = generateApiErrorMessage('/api/users', 500, error);
      
      expect(result.title).toBe('Service Unavailable - API Service');
      expect(result.message).toContain('calling /api/users');
      expect(result.additionalInfo?.endpoint).toBe('/api/users');
      expect(result.additionalInfo?.status).toBe(500);
      expect(result.retryPossible).toBe(true);
    });
  });

  describe('generateAiErrorMessage', () => {
    it('should generate AI error message', () => {
      const error = new Error('AI service unavailable');
      const result = generateAiErrorMessage('OpenAI', 'generating text', error);
      
      expect(result.title).toBe('AI Service Unavailable - AI Service');
      expect(result.message).toContain('generating text with OpenAI');
      expect(result.operation).toContain('generating text with OpenAI');
      expect(result.userAction).toBe('using the AI assistant');
      expect(result.retryPossible).toBe(true);
      expect(result.contactSupport).toBe(true);
    });

    it('should include AI-specific suggestions', () => {
      const error = new Error('API key invalid');
      const result = generateAiErrorMessage('Google AI', 'chat', error);
      
      expect(result.suggestions).toContain('Check if your API keys are configured correctly');
      expect(result.suggestions).toContain('Verify your AI service quota is not exceeded');
    });
  });

  describe('Error Pattern Matching', () => {
    it('should classify errors correctly based on patterns', () => {
      const testCases = [
        { error: 'Network error: ECONNRESET', expected: 'NETWORK' },
        { error: 'HTTP 404 Not Found', expected: 'RESOURCE' },
        { error: 'Authentication failed', expected: 'AUTH' },
        { error: 'Validation error: Required field missing', expected: 'VALIDATION' },
        { error: 'Rate limit exceeded', expected: 'RATE_LIMIT' },
        { error: 'OpenAI API error', expected: 'AI_SERVICE' },
        { error: 'Permission denied', expected: 'PERMISSION' },
        { error: 'API error: 500 Internal Server Error', expected: 'API' },
      ];

      testCases.forEach(({ error, expected }) => {
        const result = createUserFriendlyError(new Error(error));
        expect(result.title).toBeDefined();
        expect(result.message).toBeDefined();
        expect(result.suggestions.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Context Integration', () => {
    it('should enhance messages with context', () => {
      const error = new Error('Failed to load data');
      const context = {
        operation: 'loading your profile',
        component: 'UserProfile',
        userAction: 'view your profile',
        additionalInfo: {
          userId: '123',
          timestamp: '2023-01-01',
        },
      };

      const result = createUserFriendlyError(error, context);

      expect(result.title).toContain('UserProfile');
      expect(result.message).toContain('loading your profile');
      expect(result.suggestions).toContain('Try view your profile again');
    });
  });
});
