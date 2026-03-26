/**
 * Sentry Error Tracking Configuration
 * Production-ready error monitoring and performance tracking
 */

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import React from 'react';

// Sentry DSN - Should be environment variable in production
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || process.env.REACT_APP_SENTRY_DSN;

// Environment detection
const environment = import.meta.env.MODE || 'development';

// Sample rate for performance monitoring (0-1)
const tracesSampleRate = environment === 'production' ? 0.1 : 0.0;

// Debug mode for development
const debug = environment === 'development';

/**
 * Initialize Sentry error tracking
 */
export const initSentry = (): void => {
  // Only initialize in production or if DSN is explicitly provided
  if (!SENTRY_DSN && environment !== 'production') {
    console.info('Sentry: DSN not provided, skipping initialization in development');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Environment
    environment,
    
    // Debug mode
    debug,
    
    // Release version (from package.json)
    release: `ai-rideshare-platform@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
    
    // Integrations
    integrations: [
      new BrowserTracing({
        tracingOrigins: ['localhost', /^\//],
      }),
    ],
    
    // Performance monitoring
    tracesSampleRate,
    
    // Error filtering
    beforeSend(event, hint) {
      // Filter out certain errors in development
      if (environment === 'development') {
        // Don't send console errors or development-only errors
        if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
          return null;
        }
      }
      
      // Add custom context
      if (event.exception) {
        event.contexts = {
          ...event.contexts,
          app: {
            name: 'AI Rideshare Platform',
            version: import.meta.env.VITE_APP_VERSION || '1.0.0',
            environment,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        };
      }
      
      return event;
    },
    
    // Custom tags
    initialScope: {
      tags: {
        component: 'frontend',
        framework: 'react',
        language: 'typescript'
      }
    },
    
    // Ignore specific errors
    ignoreErrors: [
      // ResizeObserver loop limit exceeded (common in browsers)
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      // Network errors that are not actionable
      'Network request failed',
      'Failed to fetch',
      // Development-only errors
      'Warning: ReactDOM.render is deprecated',
    ],
    
    // Deny specific URLs
    denyUrls: [
      // Chrome extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
      // Third-party scripts
      /analytics\.com/i,
      /googletagmanager\.com/i,
      /google-analytics\.com/i,
    ],
  });
  
  console.log('Sentry: Error tracking initialized');
};

/**
 * Set user context for error tracking
 */
export const setUserContext = (user: { id?: string; email?: string; name?: string }): void => {
  if (!SENTRY_DSN) return;
  
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name,
  });
};

/**
 * Clear user context
 */
export const clearUserContext = (): void => {
  if (!SENTRY_DSN) return;
  
  Sentry.setUser(null);
};

/**
 * Add custom breadcrumb for tracking
 */
export const addBreadcrumb = (breadcrumb: {
  message: string;
  category?: string;
  level?: Sentry.SeverityLevel;
  data?: Record<string, any>;
}): void => {
  if (!SENTRY_DSN) return;
  
  Sentry.addBreadcrumb({
    timestamp: Date.now() / 1000,
    type: 'default',
    ...breadcrumb,
  });
};

/**
 * Track custom event
 */
export const trackEvent = (eventName: string, data?: Record<string, any>): void => {
  if (!SENTRY_DSN) return;
  
  // Add as breadcrumb for now (Sentry doesn't have direct event tracking)
  addBreadcrumb({
    message: eventName,
    category: 'custom.event',
    level: 'info',
    data,
  });
};

/**
 * Track AI command usage
 */
export const trackAICommand = (command: string, success: boolean, error?: string): void => {
  trackEvent('ai_command_executed', {
    command,
    success,
    error,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track API errors
 */
export const trackApiError = (endpoint: string, error: Error | string, statusCode?: number): void => {
  addBreadcrumb({
    message: `API Error: ${endpoint}`,
    category: 'api.error',
    level: 'error',
    data: {
      endpoint,
      error: error instanceof Error ? error.message : error,
      statusCode,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Track performance metrics
 */
export const trackPerformance = (metric: string, value: number, unit?: string): void => {
  trackEvent('performance_metric', {
    metric,
    value,
    unit: unit || 'ms',
    timestamp: new Date().toISOString(),
  });
};

/**
 * Handle unhandled errors
 */
export const handleUnhandledError = (error: Error, errorInfo?: any): void => {
  console.error('Unhandled error:', error);
  
  if (SENTRY_DSN) {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo?.componentStack,
        },
      },
    });
  }
};

/**
 * Handle unhandled promise rejections
 */
export const handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
  console.error('Unhandled promise rejection:', event.reason);
  
  if (SENTRY_DSN) {
    Sentry.captureException(event.reason, {
      tags: {
        type: 'unhandled_promise_rejection',
      },
    });
  }
};

/**
 * Check if Sentry is available
 */
export const isSentryAvailable = (): boolean => {
  return !!SENTRY_DSN;
};

export default {
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
};
