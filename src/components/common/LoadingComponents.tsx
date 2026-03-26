/**
 * Loading Components
 * Consistent loading states and progress indicators
 */

import React from 'react';
import {
  Box,
  CircularProgress,
  LinearProgress,
  Typography,
  Button,
  Fade,
  Backdrop,
  Chip,
  Stack,
  Alert,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { LoadingState } from '../hooks/useLoadingState';

export interface LoadingSpinnerProps {
  size?: number;
  thickness?: number;
  color?: 'primary' | 'secondary' | 'inherit';
  message?: string;
  overlay?: boolean;
}

/**
 * Basic loading spinner with optional message
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  thickness = 4,
  color = 'primary',
  message,
  overlay = false,
}) => {
  const content = (
    <Stack alignItems="center" spacing={2}>
      <CircularProgress size={size} thickness={thickness} color={color} />
      {message && (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {message}
        </Typography>
      )}
    </Stack>
  );

  if (overlay) {
    return (
      <Backdrop
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: (theme) => theme.zIndex.modal + 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        open
      >
        {content}
      </Backdrop>
    );
  }

  return content;
};

export interface LoadingProgressProps {
  progress: number;
  message?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'secondary' | 'inherit';
  height?: number;
}

/**
 * Linear progress bar with percentage
 */
export const LoadingProgress: React.FC<LoadingProgressProps> = ({
  progress,
  message,
  showPercentage = true,
  color = 'primary',
  height = 8,
}) => {
  return (
    <Box>
      {message && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {message}
          {showPercentage && ` (${Math.round(progress)}%)`}
        </Typography>
      )}
      <Box sx={{ position: 'relative', height }}>
        <LinearProgress
          variant="determinate"
          value={progress}
          color={color}
          sx={{
            height,
            borderRadius: height / 2,
            backgroundColor: 'grey.200',
          }}
        />
        {showPercentage && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              textShadow: '0 0 4px rgba(0,0,0,0.5)',
            }}
          >
            {`${Math.round(progress)}%`}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export interface LoadingStateProps {
  loadingState: LoadingState;
  message?: string;
  children: React.ReactNode;
  errorComponent?: React.ReactNode;
  successComponent?: React.ReactNode;
  onRetry?: () => void;
  showProgress?: boolean;
}

/**
 * Complete loading state component with error handling
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  loadingState,
  message,
  children,
  errorComponent,
  successComponent,
  onRetry,
  showProgress = false,
}) => {
  const { isLoading, isRetrying, attempt, maxRetries, error, lastSuccess } = loadingState;

  if (isLoading) {
    return (
      <Fade in={isLoading}>
        <Box display="flex" flexDirection="column" alignItems="center" py={4}>
          {showProgress && maxRetries > 0 ? (
            <LoadingProgress
              progress={(attempt / maxRetries) * 100}
              message={isRetrying ? `Retrying... (Attempt ${attempt}/${maxRetries})` : message || 'Loading...'}
              showPercentage
            />
          ) : (
            <LoadingSpinner
              message={isRetrying ? `Retrying... (Attempt ${attempt}/${maxRetries})` : message || 'Loading...'}
              size={48}
            />
          )}
        </Box>
      </Fade>
    );
  }

  if (error) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }

    return (
      <Fade in={!!error}>
        <Box display="flex" flexDirection="column" alignItems="center" py={4}>
          <ErrorIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h6" color="error" gutterBottom textAlign="center">
            Something went wrong
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
            {error.message || 'An unexpected error occurred. Please try again.'}
          </Typography>
          {onRetry && attempt < maxRetries && (
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
              disabled={isLoading}
            >
              Try Again
            </Button>
          )}
          <Box mt={2}>
            <Chip
              label={`Attempt ${attempt}/${maxRetries}`}
              size="small"
              color="default"
              variant="outlined"
            />
          </Box>
        </Box>
      </Fade>
    );
  }

  if (lastSuccess && successComponent) {
    return <>{successComponent}</>;
  }

  return <>{children}</>;
};

export interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: React.ReactNode;
}

/**
 * Overlay that covers children while loading
 */
export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Loading...',
  children,
}) => {
  return (
    <Box sx={{ position: 'relative' }}>
      {children}
      {isLoading && (
        <LoadingSpinner
          message={message}
          overlay
          size={60}
        />
      )}
    </Box>
  );
};

export interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  loadingText?: string;
  onClick?: () => void;
  [key: string]: any;
}

/**
 * Button with loading state
 */
export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  children,
  disabled,
  loadingText = 'Loading...',
  onClick,
  ...props
}) => {
  return (
    <Button
      {...props}
      disabled={disabled || loading}
      onClick={onClick}
      startIcon={loading ? <CircularProgress size={20} /> : props.startIcon}
    >
      {loading ? loadingText : children}
    </Button>
  );
};

export interface LoadingCardProps {
  loading: boolean;
  error?: Error | null;
  children: React.ReactNode;
  title?: string;
  minHeight?: number;
  onRetry?: () => void;
}

/**
 * Card with loading and error states
 */
export const LoadingCard: React.FC<LoadingCardProps> = ({
  loading,
  error,
  children,
  title,
  minHeight = 200,
  onRetry,
}) => {
  if (loading) {
    return (
      <Box
        sx={{
          minHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid',
          borderColor: 'grey.200',
          borderRadius: 1,
        }}
      >
        <LoadingSpinner message={title ? `Loading ${title}...` : undefined} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid',
          borderColor: 'error.main',
          borderRadius: 1,
          p: 2,
        }}
      >
        <Alert
          severity="error"
          action={
            onRetry && (
              <Button size="small" onClick={onRetry}>
                Retry
              </Button>
            )
          }
        >
          <Typography variant="body2">
            {title ? `Failed to load ${title}` : 'Loading failed'}: {error.message}
          </Typography>
        </Alert>
      </Box>
    );
  }

  return <>{children}</>;
};

export interface LoadingSkeletonProps {
  children: React.ReactNode;
  loading: boolean;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: number | string;
  height?: number | string;
}

/**
 * Skeleton loader that shows when loading
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  children,
  loading,
  variant = 'text',
  width,
  height,
}) => {
  return (
    <Box sx={{ width, height }}>
      {loading ? (
        <Box
          sx={{
            bgcolor: 'grey.200',
            borderRadius: variant === 'circular' ? '50%' : 1,
            ...(variant === 'text' && { height: 20 }),
            ...(variant === 'rectangular' && { height: height || 100 }),
            ...(variant === 'circular' && { width: width || 40, height: height || 40 }),
          }}
        />
      ) : (
        children
      )}
    </Box>
  );
};

export default {
  LoadingSpinner,
  LoadingProgress,
  LoadingState,
  LoadingOverlay,
  LoadingButton,
  LoadingCard,
  LoadingSkeleton,
};
