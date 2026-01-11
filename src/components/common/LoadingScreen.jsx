import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingScreen = ({ message = 'Loading...' }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: 'background.default',
      gap: 2,
    }}
  >
    <CircularProgress size={60} thickness={4} />
    <Typography variant="h6" color="text.secondary">
      {message}
    </Typography>
  </Box>
);

export default LoadingScreen;
