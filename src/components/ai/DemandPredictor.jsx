import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  MenuItem,
  Chip,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendIcon,
  LocationOn as LocationIcon,
  Schedule as TimeIcon,
  Analytics as AnalyticsIcon,
  Lightbulb as InsightIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { styled } from '@mui/material/styles';
import { m } from 'framer-motion';
import aiService from '../../services/aiService';

const PredictionCard = styled(Card)(({ theme }) => ({
  height: '100%',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
  border: `1px solid ${theme.palette.divider}`,
}));

const MetricCard = styled(Card)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(2),
  background: theme.palette.background.paper,
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const locations = [
  'Bole Area',
  'Piazza',
  'Merkato',
  'Addis Ababa Bole International Airport',
  'Meskel Square',
  'Kazanchis',
  'Mexico',
  'CMC',
];

const DemandPredictor = () => {
  const [selectedLocation, setSelectedLocation] = useState('Bole Area');
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPrediction = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await aiService.predictDemand(selectedLocation, '24h');
      setPrediction(result);
    } catch (err) {
      setError('Failed to fetch demand prediction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, [selectedLocation]);

  const formatHour = (hour) => {
    return hour === 0 ? '12 AM' : hour <= 12 ? `${hour} AM` : `${hour - 12} PM`;
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AnalyticsIcon sx={{ mr: 1 }} />
        AI Demand Prediction
      </Typography>

      {/* Location Selector */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Select Location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              variant="outlined"
            >
              {locations.map((location) => (
                <MenuItem key={location} value={location}>
                  <LocationIcon sx={{ mr: 1, fontSize: 'small' }} />
                  {location}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <Button
              variant="contained"
              onClick={fetchPrediction}
              disabled={isLoading}
              startIcon={<TrendIcon />}
              fullWidth
            >
              {isLoading ? 'Analyzing...' : 'Update Prediction'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {isLoading && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            AI Processing Demand Data...
          </Typography>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Analyzing historical patterns, current events, weather data, and traffic conditions...
          </Typography>
        </Paper>
      )}

      {prediction && (
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Grid container spacing={3}>
            {/* Current Demand */}
            <Grid item xs={12} md={4}>
              <MetricCard>
                <TrendIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" color="primary.main" gutterBottom>
                  {prediction.currentDemand}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Current Demand Level
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rides requested in the last hour
                </Typography>
              </MetricCard>
            </Grid>

            {/* Peak Hours */}
            <Grid item xs={12} md={8}>
              <PredictionCard>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Peak Hours Today
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {prediction.peakHours.map((hour) => (
                      <Chip
                        key={hour}
                        label={formatHour(hour)}
                        color="primary"
                        variant="outlined"
                        icon={<TimeIcon />}
                      />
                    ))}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    AI-predicted high demand periods based on historical data and current trends
                  </Typography>
                </CardContent>
              </PredictionCard>
            </Grid>

            {/* 24-Hour Demand Forecast */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  24-Hour Demand Forecast
                </Typography>
                <Box sx={{ height: 300, mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={prediction.predictedDemand}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="hour" 
                        tickFormatter={formatHour}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(hour) => `Time: ${formatHour(hour)}`}
                        formatter={(value, name) => [
                          name === 'demand' ? `${value} rides` : `${(value * 100).toFixed(1)}%`,
                          name === 'demand' ? 'Predicted Demand' : 'Confidence'
                        ]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="demand" 
                        stroke="#1976d2" 
                        strokeWidth={3}
                        dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="confidence" 
                        stroke="#ff9800" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        yAxisId="right"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            {/* Confidence Levels */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Prediction Confidence
                </Typography>
                <Box sx={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prediction.predictedDemand.slice(0, 12)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" tickFormatter={formatHour} />
                      <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                      <Tooltip 
                        formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Confidence']}
                        labelFormatter={(hour) => `Time: ${formatHour(hour)}`}
                      />
                      <Bar 
                        dataKey="confidence" 
                        fill="#4caf50"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            {/* AI Recommendations */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <InsightIcon sx={{ mr: 1 }} />
                  AI Recommendations
                </Typography>
                <Box>
                  {prediction.recommendations.map((recommendation, index) => (
                    <Alert 
                      key={index} 
                      severity="info" 
                      sx={{ mb: 1 }}
                      icon={<InsightIcon />}
                    >
                      {recommendation}
                    </Alert>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </m.div>
      )}
    </Box>
  );
};

export default DemandPredictor;