import React, { Component } from 'react';
import { Box, Button, Typography, Paper, useTheme } from '@mui/material';
import { Error as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { handleUnhandledError, addBreadcrumb, isSentryAvailable } from '../../utils/sentry';
import { generateErrorBoundaryMessage } from '../../utils/errorMessages';
import { ErrorBoundaryFallback } from './ErrorComponents';

/**
 * ErrorBoundary component to catch JavaScript errors in child components
 * and display a fallback UI instead of the component tree that crashed.
 */

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error | null; errorInfo: React.ErrorInfo | null; onReset: () => void; eventId: string | null }>;
  onReset?: () => void;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showReset?: boolean;
  showDetails?: boolean;
  [key: string]: unknown;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  eventId: string | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      eventId: null 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to an error reporting service
    this.logErrorToService(error, errorInfo);
    
    this.setState({
      error: error || new Error('Unknown error'),
      errorInfo,
      hasError: true
    });
  }

  logErrorToService = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log the error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Add breadcrumb for context
    addBreadcrumb({
      message: 'React Error Boundary triggered',
      category: 'error.boundary',
      level: 'error',
      data: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        timestamp: new Date().toISOString(),
      },
    });

    // Handle the error with Sentry if available
    if (isSentryAvailable()) {
      handleUnhandledError(error, errorInfo);
      
      // Generate event ID for user reference
      const eventId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.setState({ eventId });
    } else {
      // Fallback: Generate local error ID
      const eventId = `local_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.setState({ eventId });
    }
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    });
    
    // Call the onReset callback if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { 
      children, 
      fallback: FallbackComponent,
      showReset = true,
      showDetails = process.env.NODE_ENV !== 'production',
      ...rest
    } = this.props;

    if (hasError) {
      // If a custom fallback component is provided, use it
      if (FallbackComponent) {
        return (
          <FallbackComponent 
            error={error} 
            errorInfo={errorInfo} 
            onReset={this.handleReset} 
            eventId={this.state.eventId}
            {...rest}
          />
        );
      }

      // Default fallback UI
      return (
        <ErrorBoundaryFallback 
          error={error} 
          errorInfo={errorInfo} 
          onReset={this.handleReset}
          showReset={showReset}
          showDetails={showDetails}
          {...rest}
        />
      );
    }

    return children;
  }
}

export { ErrorBoundary };

export default ErrorBoundary;
