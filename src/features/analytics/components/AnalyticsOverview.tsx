import { Box, Typography, Paper } from '@mui/material';

const AnalyticsOverview = () => {
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Analytics Overview
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Real-time analytics and insights will be displayed here.
      </Typography>
    </Paper>
  );
};

export default AnalyticsOverview;
