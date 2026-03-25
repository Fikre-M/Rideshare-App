import React from 'react';
import { Box, CircularProgress, LinearProgress, Typography } from '@mui/material';

/**
 * LoadingScreen component for displaying loading states
 * @param {Object} props - Component props
 * @param {string} [props.message='Loading...'] - Loading message to display
 * @param {boolean} [props.fullScreen=true] - Whether to take up the full viewport
 * @param {boolean} [props.showProgress=true] - Whether to show the circular progress indicator
 * @param {boolean} [props.linear=false] - Use linear progress instead of circular
 * @param {number} [props.progress] - Progress value (0-100) for controlled progress
 * @param {string} [props.size='large'] - Size of the progress indicator (small, medium, large)
 * @param {string} [props.color='primary'] - Color of the progress indicator
 * @param {Object} [props.sx] - Additional styles
 * @returns {JSX.Element} Loading screen component
 */
const LoadingScreen = ({
  message = 'Loading...',
  fullScreen = true,
  showProgress = true,
  linear = false,
  progress,
  size = 'large',
  color = 'primary',
  sx = {},
}: {
  message?: string;
  fullScreen?: boolean;
  showProgress?: boolean;
  linear?: boolean;
  progress?: number;
  size?: string;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'inherit';
  sx?: object;
}) => {
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 60,
  };

  const progressSize = sizeMap[size] || 60;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        backgroundColor: 'background.default',
        gap: 2,
        p: 3,
        ...(fullScreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1400,
        }),
        ...sx,
      }}
    >
        {showProgress && (
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            {linear ? (
              <Box sx={{ width: '100%', maxWidth: 360 }}>
                <LinearProgress
                  variant={progress !== undefined ? 'determinate' : 'indeterminate'}
                  value={progress}
                  color={color}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                  }}
                />
                {progress !== undefined && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: `${color}.main`,
                      fontWeight: 'medium',
                    }}
                  >
                    {`${Math.round(progress)}%`}
                  </Box>
                )}
              </Box>
            ) : (
              <CircularProgress
                size={progressSize}
                thickness={4}
                color={color}
                variant={progress !== undefined ? 'determinate' : 'indeterminate'}
                value={progress}
              />
            )}
          </Box>
        )}
        
        {message && (
          <Typography
            variant={size === 'small' ? 'body1' : 'h6'}
            color="text.secondary"
            align="center"
            sx={{
              maxWidth: 400,
              mx: 'auto',
              ...(size === 'small' && { fontSize: '0.875rem' }),
            }}
          >
            {message}
          </Typography>
        )}
    </Box>
  );
};

export default React.memo(LoadingScreen);

// Helper component for page-level loading
LoadingScreen.Page = (props) => (
  <Box sx={{ minHeight: '60vh', display: 'flex' }}>
    <LoadingScreen fullScreen={false} size="large" {...props} />
  </Box>
);

// Helper component for section-level loading
LoadingScreen.Section = (props) => (
  <Box sx={{ py: 8, display: 'flex' }}>
    <LoadingScreen fullScreen={false} size="medium" {...props} />
  </Box>
);

// Helper component for inline loading
LoadingScreen.Inline = (props) => (
  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
    <CircularProgress size={16} thickness={4} color={props.color || 'primary'} />
    {props.message && (
      <Typography variant="body2" color="text.secondary">
        {props.message}
      </Typography>
    )}
  </Box>
);
