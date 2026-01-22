import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp as TrendIcon,
  AttachMoney as RevenueIcon,
  DirectionsCar as UtilizationIcon,
  Lightbulb as InsightIcon,
  Schedule as TimeIcon,
  CloudQueue as WeatherIcon,
  Event as EventIcon,
  Traffic as TrafficIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import aiService from '../../services/aiService';

const MetricCard = styled(Card)(({ theme, trend }) => ({
  background: trend === 'up' 
    ? `linear-gradient(135deg, ${theme.palette.success.main}15 0%, ${theme.palette.success.main}25 100%)`
    : trend === 'down'
    ? `linear-gradient(135deg, ${theme.palette.error.main}15 0%, ${theme.palette.error.main}25 100%)`
    : `linear-gradient(135deg, ${theme.palette.info.main}15 0%, ${theme.palette.info.main}25 100%)`,
  border: `1px solid ${
    trend === 'up' ? theme.palette.success.main
    : trend === 'down' ? theme.palette.error.main
    : theme.palette.info.main
  }`,
  textAlign: 'center',
  padding: theme.spacing(2),
}));

const InsightCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1),
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateX(4px)',
  },
}));

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const PredictiveAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [timeframe, setTimeframe] = useState('24h');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await aiService.getPredictiveAnalytics(timeframe);
      setAnalytics(result);
    } catch (err) {
      setError('Failed to fetch predictive analytics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const formatHour = (hour) => {
    return hour === 0 ? '12 AM' : hour <= 12 ? `${hour} AM` : `${hour - 12} PM`;
  };

  const getUtilizationColor = (utilization) => {
    if (utilization >= 0.8) return 'success';
    if (utilization >= 0.6) return 'warning';
    return 'error';
  };

  const utilizationData = analytics ? [
    { name: 'Current', value: analytics.driverUtilization.current * 100, color: COLORS[0] },
    { name: 'Predicted', value: analytics.driverUtilization.predicted * 100, color: COLORS[1] },
    { name: 'Optimal', value: analytics.driverUtilization.optimal * 100, color: COLORS[2] },
  ] : [];

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <AnalyticsIcon sx={{ mr: 1 }} />
        AI Predictive Analytics
      </Typography>

      {/* Timeframe Selector */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">Forecast Timeframe:</Typography>
          {['24h', '7d', '30d'].map((period) => (
            <Chip
              key={period}
              label={period === '24h' ? '24 Hours' : period === '7d' ? '7 Days' : '30 Days'}
              onClick={() => setTimeframe(period)}
              color={timeframe === period ? 'primary' : 'default'}
              variant={timeframe === period ? 'filled' : 'outlined'}
            />
          ))}
          <Button
            variant="contained"
            onClick={fetchAnalytics}
            disabled={isLoading}
            startIcon={<TrendIcon />}
            sx={{ ml: 'auto' }}
          >
            {isLoading ? 'Analyzing...' : 'Refresh Analytics'}
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {isLoading && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            AI Processing Predictive Models...
          </Typography>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Analyzing historical data, market trends, seasonal patterns, and external factors...
          </Typography>
        </Paper>
      )}

      {analytics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Grid container spacing={3}>
            {/* Revenue Projections */}
            <Grid item xs={12} md={4}>
              <MetricCard trend="up">
                <Avatar sx={{ bgcolor: 'success.main', width: 60, height: 60, mx: 'auto', mb: 2 }}>
                  <RevenueIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h4" color="success.main" gutterBottom>
                  ${analytics.revenueProjection.today.toLocaleString()}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Projected Today
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  +12% vs yesterday
                </Typography>
              </MetricCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <MetricCard trend="up">
                <Avatar sx={{ bgcolor: 'info.main', width: 60, height: 60, mx: 'auto', mb: 2 }}>
                  <RevenueIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h4" color="info.main" gutterBottom>
                  ${analytics.revenueProjection.thisWeek.toLocaleString()}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Projected This Week
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  +8% vs last week
                </Typography>
              </MetricCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <MetricCard trend="up">
                <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60, mx: 'auto', mb: 2 }}>
                  <RevenueIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h4" color="primary.main" gutterBottom>
                  ${analytics.revenueProjection.thisMonth.toLocaleString()}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Projected This Month
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  +15% vs last month
                </Typography>
              </MetricCard>
            </Grid>

            {/* Demand Forecast Chart */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  24-Hour Ride Demand Forecast
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.rideDemandForecast.next24Hours}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" tickFormatter={formatHour} />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(hour) => `Time: ${formatHour(hour)}`}
                        formatter={(value, name) => [
                          name === 'predictedRides' ? `${value} rides` : `${(value * 100).toFixed(1)}%`,
                          name === 'predictedRides' ? 'Predicted Rides' : 'Confidence'
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="predictedRides"
                        stroke="#1976d2"
                        fill="#1976d2"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="confidence"
                        stroke="#ff9800"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            {/* Driver Utilization */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Driver Utilization
                </Typography>
                <Box sx={{ height: 200, mb: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={utilizationData}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                      >
                        {utilizationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Alert severity={getUtilizationColor(analytics.driverUtilization.current)}>
                  Current utilization: {(analytics.driverUtilization.current * 100).toFixed(1)}%
                </Alert>
              </Paper>
            </Grid>

            {/* AI Insights */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <InsightIcon sx={{ mr: 1 }} />
                  AI-Generated Insights & Recommendations
                </Typography>
                <Grid container spacing={2}>
                  {analytics.insights.map((insight, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <InsightCard>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <Avatar sx={{ bgcolor: 'primary.light', mr: 2, mt: 0.5 }}>
                              {index === 0 ? <TimeIcon /> : 
                               index === 1 ? <WeatherIcon /> :
                               index === 2 ? <EventIcon /> : <TrafficIcon />}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" gutterBottom>
                                {insight}
                              </Typography>
                              <Chip
                                label="AI Recommendation"
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </Box>
                          </Box>
                        </InsightCard>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>

            {/* Key Metrics Summary */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  AI Model Performance & Accuracy
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        94.2%
                      </Typography>
                      <Typography variant="subtitle2">
                        Demand Prediction Accuracy
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main">
                        87.8%
                      </Typography>
                      <Typography variant="subtitle2">
                        Revenue Forecast Accuracy
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="warning.main">
                        91.5%
                      </Typography>
                      <Typography variant="subtitle2">
                        Driver Matching Success
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary.main">
                        96.1%
                      </Typography>
                      <Typography variant="subtitle2">
                        Route Optimization Efficiency
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </motion.div>
      )}
    </Box>
  );
};

export default PredictiveAnalytics;