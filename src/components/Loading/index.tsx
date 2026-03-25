import { CircularProgress, Box, Typography } from '@mui/material';

const Loading = ({ message = 'Loading...', size = 40, thickness = 4 }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={4}
      minHeight={200}
    >
      <CircularProgress 
        size={size} 
        thickness={thickness}
        sx={{ mb: 2 }}
      />
      {message && (
        <Typography 
          variant="body2" 
          color="textSecondary"
          align="center"
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default Loading;
