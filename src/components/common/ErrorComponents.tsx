/**
 * User-Friendly Error Components
 * Display errors in a user-friendly way with actionable suggestions
 */

import React, { useState } from 'react';
import {
  Box,
  Alert,
  AlertTitle,
  Button,
  Typography,
  Collapse,
  Chip,
  Stack,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  BugReport as BugIcon,
  Support as SupportIcon,
  ArrowForward as ArrowIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import {
  UserFriendlyError,
  formatErrorForDisplay,
  getErrorIcon,
  getErrorColor,
} from '../../utils/errorMessages';

export interface UserFriendlyErrorProps {
  error: UserFriendlyError;
  onRetry?: () => void;
  onRefresh?: () => void;
  onContactSupport?: () => void;
  showTechnicalDetails?: boolean;
  className?: string;
}

/**
 * Main user-friendly error display component
 */
export const UserFriendlyErrorDisplay: React.FC<UserFriendlyErrorProps> = ({
  error,
  onRetry,
  onRefresh,
  onContactSupport,
  showTechnicalDetails = false,
  className,
}) => {
  const [expanded, setExpanded] = useState(false);
  const formatted = formatErrorForDisplay(error);
  const errorIcon = getErrorIcon(error.severity.level);
  const errorColor = getErrorColor(error.severity.level);

  const handleAction = (action: string) => {
    switch (action) {
      case 'retry':
        onRetry?.();
        break;
      case 'refresh':
        onRefresh?.();
        break;
      case 'contact':
        onContactSupport?.();
        break;
      default:
        console.warn(`Unknown action: ${action}`);
    }
  };

  const getSeverityIcon = () => {
    switch (error.severity.level) {
      case 'info':
        return <InfoIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'critical':
        return <ErrorIcon />;
      default:
        return <ErrorIcon />;
    }
  };

  return (
    <Box className={className}>
      <Alert
        severity={error.severity.level as any}
        icon={getSeverityIcon()}
        action={
          <Stack direction="row" spacing={1}>
            {formatted.actions.map((action, index) => (
              <Button
                key={action.action}
                size="small"
                variant={action.primary ? 'contained' : 'outlined'}
                color={action.primary ? 'primary' : 'inherit'}
                onClick={() => handleAction(action.action)}
                startIcon={
                  action.action === 'retry' ? <RefreshIcon /> :
                  action.action === 'refresh' ? <RefreshIcon /> :
                  action.action === 'contact' ? <SupportIcon /> :
                  undefined
                }
              >
                {action.label}
              </Button>
            ))}
          </Stack>
        }
        sx={{
          '& .MuiAlert-message': {
            width: '100%',
          },
        }}
      >
        <AlertTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>{errorIcon}</span>
          {formatted.title}
        </AlertTitle>
        
        <Typography variant="body2" sx={{ mt: 1 }}>
          {formatted.message}
        </Typography>

        {/* Suggestions */}
        {error.suggestions.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              What you can try:
            </Typography>
            <List dense>
              {error.suggestions.map((suggestion, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <ArrowIcon sx={{ fontSize: 16, color: errorColor }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={suggestion}
                    primaryTypographyProps={{
                      variant: 'body2',
                      color: 'text.secondary',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Error code */}
        {error.errorCode && (
          <Box sx={{ mt: 1 }}>
            <Chip
              label={`Error Code: ${error.errorCode}`}
              size="small"
              variant="outlined"
              color="default"
            />
          </Box>
        )}

        {/* Technical details toggle */}
        {(showTechnicalDetails || error.technicalDetails) && (
          <Box sx={{ mt: 2 }}>
            <Button
              size="small"
              onClick={() => setExpanded(!expanded)}
              startIcon={<ExpandMoreIcon />}
              sx={{ textTransform: 'none' }}
            >
              {expanded ? 'Hide' : 'Show'} Technical Details
            </Button>
            
            <Collapse in={expanded}>
              <Box sx={{ mt: 1 }}>
                <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'grey.50' }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BugIcon fontSize="small" />
                    Technical Information
                  </Typography>
                  {error.technicalDetails && (
                    <Typography
                      variant="body2"
                      component="pre"
                      sx={{
                        fontSize: '0.75rem',
                        color: 'text.secondary',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        maxHeight: 200,
                        overflow: 'auto',
                        p: 1,
                        backgroundColor: 'grey.100',
                        borderRadius: 1,
                      }}
                    >
                      {error.technicalDetails}
                    </Typography>
                  )}
                  {error.errorCode && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Error Code:</strong> {error.errorCode}
                    </Typography>
                  )}
                </Paper>
              </Box>
            </Collapse>
          </Box>
        )}
      </Alert>
    </Box>
  );
};

export interface InlineErrorProps {
  error: UserFriendlyError;
  compact?: boolean;
  onRetry?: () => void;
}

/**
 * Compact inline error display
 */
export const InlineError: React.FC<InlineErrorProps> = ({
  error,
  compact = false,
  onRetry,
}) => {
  const errorIcon = getErrorIcon(error.severity.level);
  const errorColor = getErrorColor(error.severity.level);

  if (compact) {
    return (
      <Stack direction="row" spacing={1} alignItems="center" sx={{ py: 1 }}>
        <span>{errorIcon}</span>
        <Typography variant="body2" color="text.secondary">
          {error.title}
        </Typography>
        {error.retryPossible && onRetry && (
          <Button
            size="small"
            variant="text"
            onClick={onRetry}
            sx={{ minWidth: 'auto', p: 0.5 }}
          >
            Retry
          </Button>
        )}
      </Stack>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Typography variant="h6" sx={{ fontSize: '1.5rem' }}>
          {errorIcon}
        </Typography>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            {error.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {error.message}
          </Typography>
          
          {error.suggestions.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Suggestions:
              </Typography>
              <Stack spacing={0.5}>
                {error.suggestions.slice(0, 2).map((suggestion, index) => (
                  <Typography key={index} variant="body2" color="text.secondary">
                    • {suggestion}
                  </Typography>
                ))}
              </Stack>
            </Box>
          )}
          
          {error.retryPossible && onRetry && (
            <Button
              variant="outlined"
              size="small"
              onClick={onRetry}
              startIcon={<RefreshIcon />}
              sx={{ mt: 1 }}
            >
              Try Again
            </Button>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export interface ErrorBoundaryFallbackProps {
  error: Error | null;
  errorInfo: any;
  onReset?: () => void;
}

/**
 * Error boundary fallback with user-friendly messaging
 */
export const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  errorInfo,
  onReset,
}) => {
  const userError = error ? {
    title: 'Something went wrong',
    message: 'We encountered an unexpected error while rendering this page. Our team has been notified and is working to fix this issue.',
    suggestions: [
      'Try refreshing the page',
      'Check your internet connection',
      'Clear your browser cache',
      'Contact support if the problem persists',
    ],
    severity: { level: 'error' as const, userFriendly: true, actionable: true },
    retryPossible: true,
    contactSupport: true,
    technicalDetails: error.stack,
  } : {
    title: 'Unknown Error',
    message: 'An unknown error occurred. Please try refreshing the page.',
    suggestions: [
      'Try refreshing the page',
      'Check your internet connection',
    ],
    severity: { level: 'error' as const, userFriendly: true, actionable: true },
    retryPossible: true,
    contactSupport: false,
    technicalDetails: undefined,
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 3,
        backgroundColor: 'background.default',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 600,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" gutterBottom color="error">
          🚨 Oops! Something went wrong
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          {userError.message}
        </Typography>

        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
          <Button
            variant="contained"
            onClick={onReset}
            startIcon={<RefreshIcon />}
          >
            Try Again
          </Button>
          <Button
            variant="outlined"
            onClick={() => window.location.reload()}
            startIcon={<RefreshIcon />}
          >
            Refresh Page
          </Button>
        </Stack>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            What you can try:
          </Typography>
          <List dense>
            {userError.suggestions.map((suggestion, index) => (
              <ListItem key={index} sx={{ justifyContent: 'center' }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckIcon color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={suggestion}
                  primaryTypographyProps={{
                    variant: 'body2',
                    color: 'text.secondary',
                    textAlign: 'center',
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" color="text.secondary">
          If this problem continues, please contact our support team with the
          following information:
        </Typography>
        
        <Box sx={{ mt: 1 }}>
          <Chip
            label={`Error ID: ${Date.now()}-${Math.random().toString(36).substr(2, 9)}`}
            size="small"
            variant="outlined"
            color="default"
          />
        </Box>
      </Paper>
    </Box>
  );
};

export interface ToastErrorProps {
  error: UserFriendlyError;
  onClose?: () => void;
}

/**
 * Toast-style error notification
 */
export const ToastError: React.FC<ToastErrorProps> = ({
  error,
  onClose,
}) => {
  const errorIcon = getErrorIcon(error.severity.level);

  return (
    <Box sx={{ maxWidth: 400 }}>
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <Typography variant="body1">
          {errorIcon}
        </Typography>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {error.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error.message}
          </Typography>
        </Box>
        {onClose && (
          <IconButton size="small" onClick={onClose}>
            ×
          </IconButton>
        )}
      </Stack>
    </Box>
  );
};

export default {
  UserFriendlyErrorDisplay,
  InlineError,
  ErrorBoundaryFallback,
  ToastError,
};
