/**
 * Error Message Utilities
 * Transform technical errors into user-friendly messages
 */

export interface ErrorContext {
  operation?: string;
  component?: string;
  userAction?: string;
  additionalInfo?: Record<string, any>;
}

export interface ErrorSeverity {
  level: 'info' | 'warning' | 'error' | 'critical';
  userFriendly: boolean;
  actionable: boolean;
}

export interface UserFriendlyError {
  title: string;
  message: string;
  suggestions: string[];
  severity: ErrorSeverity;
  technicalDetails?: string;
  errorCode?: string;
  retryPossible: boolean;
  contactSupport: boolean;
}

/**
 * Error classification patterns
 */
const ERROR_PATTERNS = {
  // Network errors
  NETWORK: [
    /network error/i,
    /fetch error/i,
    /connection refused/i,
    /timeout/i,
    /econnreset/i,
    /enotfound/i,
    /offline/i,
    /no internet/i,
  ],
  
  // API errors
  API: [
    /api error/i,
    /http error/i,
    /status code/i,
    /response error/i,
    /server error/i,
  ],
  
  // Authentication errors
  AUTH: [
    /unauthorized/i,
    /forbidden/i,
    /authentication/i,
    /login required/i,
    /token/i,
    /session/i,
  ],
  
  // Validation errors
  VALIDATION: [
    /validation/i,
    /invalid/i,
    /required/i,
    /missing/i,
    /format/i,
    /constraint/i,
  ],
  
  // Rate limiting
  RATE_LIMIT: [
    /rate limit/i,
    /quota/i,
    /too many requests/i,
    /429/i,
    /throttle/i,
  ],
  
  // AI service errors
  AI_SERVICE: [
    /ai error/i,
    /openai/i,
    /google ai/i,
    /gemini/i,
    /model error/i,
    /prompt error/i,
  ],
  
  // Permission errors
  PERMISSION: [
    /permission denied/i,
    /access denied/i,
    /not allowed/i,
    /forbidden/i,
  ],
  
  // Resource errors
  RESOURCE: [
    /not found/i,
    /404/i,
    /missing resource/i,
    /file not found/i,
  ],
};

/**
 * Error message templates
 */
const ERROR_MESSAGES = {
  // Network errors
  NETWORK: {
    title: 'Connection Problem',
    message: 'We\'re having trouble connecting to our servers. Please check your internet connection and try again.',
    suggestions: [
      'Check your internet connection',
      'Try refreshing the page',
      'Wait a moment and try again',
      'Contact support if the problem persists',
    ],
  },
  
  // API errors
  API: {
    title: 'Service Unavailable',
    message: 'Our servers are experiencing issues. We\'re working to fix this as quickly as possible.',
    suggestions: [
      'Try again in a few minutes',
      'Check our status page for updates',
      'Contact support if the problem continues',
    ],
  },
  
  // Authentication errors
  AUTH: {
    title: 'Authentication Required',
    message: 'You need to be logged in to access this feature.',
    suggestions: [
      'Log in to your account',
      'Check if your session has expired',
      'Create an account if you don\'t have one',
    ],
  },
  
  // Validation errors
  VALIDATION: {
    title: 'Invalid Input',
    message: 'Please check your input and try again.',
    suggestions: [
      'Review the highlighted fields',
      'Make sure all required fields are filled',
      'Check the format of your data',
    ],
  },
  
  // Rate limiting
  RATE_LIMIT: {
    title: 'Too Many Requests',
    message: 'You\'ve made too many requests. Please wait a moment before trying again.',
    suggestions: [
      'Wait a few minutes and try again',
      'Upgrade your plan for higher limits',
      'Contact support for assistance',
    ],
  },
  
  // AI service errors
  AI_SERVICE: {
    title: 'AI Service Unavailable',
    message: 'Our AI assistant is currently experiencing issues. We\'re working to restore service.',
    suggestions: [
      'Try again in a few minutes',
      'Use basic features while AI is unavailable',
      'Contact support if you need immediate assistance',
    ],
  },
  
  // Permission errors
  PERMISSION: {
    title: 'Access Denied',
    message: 'You don\'t have permission to access this resource.',
    suggestions: [
      'Check your account permissions',
      'Contact your administrator',
      'Upgrade your plan if needed',
    ],
  },
  
  // Resource errors
  RESOURCE: {
    title: 'Resource Not Found',
    message: 'The resource you\'re looking for doesn\'t exist or has been moved.',
    suggestions: [
      'Check the URL or page address',
      'Go back to the previous page',
      'Search for what you\'re looking for',
    ],
  },
  
  // Default error
  DEFAULT: {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. We\'re working to fix this issue.',
    suggestions: [
      'Try refreshing the page',
      'Check your internet connection',
      'Contact support if the problem persists',
    ],
  },
};

/**
 * Classify error based on message and type
 */
function classifyError(error: Error | string): keyof typeof ERROR_MESSAGES {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorString = errorMessage.toLowerCase();
  
  // Check each pattern category
  for (const [category, patterns] of Object.entries(ERROR_PATTERNS)) {
    if (patterns.some(pattern => pattern.test(errorString))) {
      return category as keyof typeof ERROR_MESSAGES;
    }
  }
  
  return 'DEFAULT';
}

/**
 * Extract error code from error
 */
function extractErrorCode(error: Error | string): string | undefined {
  const errorMessage = error instanceof Error ? error.message : error;
  
  // Look for HTTP status codes
  const statusMatch = errorMessage.match(/status\s*(\d{3})/i);
  if (statusMatch) return statusMatch[1];
  
  // Look for error codes in brackets
  const codeMatch = errorMessage.match(/\[([A-Z0-9_-]+)\]/i);
  if (codeMatch) return codeMatch[1];
  
  return undefined;
}

/**
 * Determine if retry is possible
 */
function canRetry(error: Error | string, context?: ErrorContext): boolean {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorString = errorMessage.toLowerCase();
  
  // Don't retry on authentication or permission errors
  if (ERROR_PATTERNS.AUTH.some(pattern => pattern.test(errorString))) return false;
  if (ERROR_PATTERNS.PERMISSION.some(pattern => pattern.test(errorString))) return false;
  if (ERROR_PATTERNS.VALIDATION.some(pattern => pattern.test(errorString))) return false;
  
  // Retry on network and temporary errors
  if (ERROR_PATTERNS.NETWORK.some(pattern => pattern.test(errorString))) return true;
  if (ERROR_PATTERNS.API.some(pattern => pattern.test(errorString))) return true;
  if (ERROR_PATTERNS.RATE_LIMIT.some(pattern => pattern.test(errorString))) return true;
  
  return true; // Default to allowing retry
}

/**
 * Determine error severity
 */
function getSeverity(error: Error | string): ErrorSeverity {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorString = errorMessage.toLowerCase();
  
  // Critical errors
  if (ERROR_PATTERNS.AUTH.some(pattern => pattern.test(errorString))) {
    return { level: 'error', userFriendly: true, actionable: true };
  }
  if (ERROR_PATTERNS.PERMISSION.some(pattern => pattern.test(errorString))) {
    return { level: 'error', userFriendly: true, actionable: true };
  }
  
  // Warning level errors
  if (ERROR_PATTERNS.VALIDATION.some(pattern => pattern.test(errorString))) {
    return { level: 'warning', userFriendly: true, actionable: true };
  }
  if (ERROR_PATTERNS.RATE_LIMIT.some(pattern => pattern.test(errorString))) {
    return { level: 'warning', userFriendly: true, actionable: true };
  }
  
  // Info level errors
  if (ERROR_PATTERNS.NETWORK.some(pattern => pattern.test(errorString))) {
    return { level: 'info', userFriendly: true, actionable: true };
  }
  if (ERROR_PATTERNS.RESOURCE.some(pattern => pattern.test(errorString))) {
    return { level: 'info', userFriendly: true, actionable: true };
  }
  
  // Default to error level
  return { level: 'error', userFriendly: true, actionable: true };
}

/**
 * Create user-friendly error message
 */
export function createUserFriendlyError(
  error: Error | string,
  context?: ErrorContext
): UserFriendlyError {
  const classification = classifyError(error);
  const template = ERROR_MESSAGES[classification];
  const errorCode = extractErrorCode(error);
  const retryPossible = canRetry(error, context);
  const severity = getSeverity(error);
  
  // Customize message based on context
  let message = template.message;
  let title = template.title;
  
  if (context?.operation) {
    message = `${template.message} This occurred while ${context.operation.toLowerCase()}.`;
  }
  
  if (context?.component) {
    title = `${template.title} - ${context.component}`;
  }
  
  // Add specific suggestions for certain contexts
  const suggestions = [...template.suggestions];
  
  if (context?.userAction && retryPossible) {
    suggestions.unshift(`Try ${context.userAction} again`);
  }
  
  // Add AI-specific suggestions
  if (classification === 'AI_SERVICE') {
    suggestions.push('Check if your API keys are configured correctly');
    suggestions.push('Verify your AI service quota is not exceeded');
  }
  
  return {
    title,
    message,
    suggestions,
    severity,
    errorCode,
    retryPossible,
    contactSupport: severity.level === 'error' || !retryPossible,
    technicalDetails: error instanceof Error ? error.stack : undefined,
  };
}

/**
 * Format error for display
 */
export function formatErrorForDisplay(error: UserFriendlyError): {
  title: string;
  message: string;
  actions: Array<{
    label: string;
    action: 'retry' | 'refresh' | 'contact' | 'navigate' | 'custom';
    primary?: boolean;
  }>;
  showTechnicalDetails: boolean;
} {
  const actions: Array<{
    label: string;
    action: 'retry' | 'refresh' | 'contact' | 'navigate' | 'custom';
    primary?: boolean;
  }> = [];
  
  if (error.retryPossible) {
    actions.push({
      label: 'Try Again',
      action: 'retry',
      primary: true,
    });
  }
  
  actions.push({
    label: 'Refresh Page',
    action: 'refresh',
  });
  
  if (error.contactSupport) {
    actions.push({
      label: 'Contact Support',
      action: 'contact',
    });
  }
  
  return {
    title: error.title,
    message: error.message,
    actions,
    showTechnicalDetails: !!error.technicalDetails,
  };
}

/**
 * Get error icon based on severity
 */
export function getErrorIcon(severity: ErrorSeverity['level']): string {
  switch (severity) {
    case 'info':
      return '🔍';
    case 'warning':
      return '⚠️';
    case 'error':
      return '❌';
    case 'critical':
      return '🚨';
    default:
      return '❌';
  }
}

/**
 * Get error color based on severity
 */
export function getErrorColor(severity: ErrorSeverity['level']): string {
  switch (severity) {
    case 'info':
      return '#2196F3'; // Blue
    case 'warning':
      return '#FF9800'; // Orange
    case 'error':
      return '#F44336'; // Red
    case 'critical':
      return '#D32F2F'; // Dark Red
    default:
      return '#F44336'; // Red
  }
}

/**
 * Error boundary fallback message generator
 */
export function generateErrorBoundaryMessage(error: Error, errorInfo: any): UserFriendlyError {
  const context: ErrorContext = {
    operation: 'rendering the page',
    component: 'React component',
    additionalInfo: {
      componentStack: errorInfo.componentStack,
    },
  };
  
  return createUserFriendlyError(error, context);
}

/**
 * API error message generator
 */
export function generateApiErrorMessage(
  endpoint: string,
  status: number,
  error: Error | string
): UserFriendlyError {
  const context: ErrorContext = {
    operation: `calling ${endpoint}`,
    component: 'API Service',
    additionalInfo: {
      endpoint,
      status,
    },
  };
  
  return createUserFriendlyError(error, context);
}

/**
 * AI service error message generator
 */
export function generateAiErrorMessage(
  service: string,
  operation: string,
  error: Error | string
): UserFriendlyError {
  const context: ErrorContext = {
    operation: `${operation} with ${service}`,
    component: 'AI Service',
    userAction: 'using the AI assistant',
  };
  
  return createUserFriendlyError(error, context);
}

export default {
  createUserFriendlyError,
  formatErrorForDisplay,
  getErrorIcon,
  getErrorColor,
  generateErrorBoundaryMessage,
  generateApiErrorMessage,
  generateAiErrorMessage,
};
