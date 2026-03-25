import { Box, Typography, Button } from '@mui/material';
import { 
  ErrorOutline as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

/**
 * ErrorState - Display when an error occurs
 * @param {Object} props
 * @param {string} [props.title='Something went wrong'] - Error title
 * @param {string} [props.message] - Error message/description
 * @param {Function} [props.onRetry] - Retry callback function
 * @param {string} [props.retryLabel='Try Again'] - Retry button label
 * @param {Object} [props.sx={}] - Additional MUI sx styles
 */
const ErrorState = ({ 
  title = 'Something went wrong',
  message = 'An error occurred while loading this content. Please try again.',
  onRetry,
  retryLabel = 'Try Again',
  sx = {}
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
        textAlign: 'center',
        ...sx
      }}
    >
      <ErrorIcon 
        sx={{ 
          fontSize: 64, 
          color: 'error.main', 
          mb: 2,
          opacity: 0.8
        }} 
      />
      
      <Typography 
        variant="h6" 
        gutterBottom
        sx={{ fontWeight: 600, color: 'error.main' }}
      >
        {title}
      </Typography>
      
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ 
          mb: 3, 
          maxWidth: 400,
          lineHeight: 1.6
        }}
      >
        {message}
      </Typography>
      
      {onRetry && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
        >
          {retryLabel}
        </Button>
      )}
    </Box>
  );
};

export default ErrorState;
