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
  Chip,
  Alert,
  LinearProgress,
  Divider,
  Avatar,
} from '@mui/material';
import {
  AttachMoney as PriceIcon,
  TrendingUp as SurgeIcon,
  Speed as SpeedIcon,
  LocationOn as LocationIcon,
  Schedule as TimeIcon,
  CloudQueue as WeatherIcon,
  Traffic as TrafficIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import aiService from '../../services/aiService';

const PriceCard = styled(Card)(({ theme, surge }) => ({
  background: surge > 1.5 
    ? `linear-gradient(135deg, ${theme.palette.error.main}15 0%, ${theme.palette.error.main}25 100%)`
    : surge > 1.2
    ? `linear-gradient(135deg, ${theme.palette.warning.main}15 0%, ${theme.palette.warning.main}25 100%)`
    : `linear-gradient(135deg, ${theme.palette.success.main}15 0%, ${theme.palette.success.main}25 100%)`,
  border: `2px solid ${
    surge > 1.5 ? theme.palette.error.main
    : surge > 1.2 ? theme.palette.warning.main
    : theme.palette.success.main
  }`,
  textAlign: 'center',
  padding: theme.spacing(2),
}));

const FactorCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
  },
}));

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const DynamicPricing = () => {
  const [tripDetails, setTripDetails] = useState({
    pickup: 'Bole Area',
    destination: 'Piazza',
    distance: 8.5,
    estimatedTime: 25,
  });
  const [pricing, setPricing] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);

  const calculatePricing = async () => {
    setIsCalculating(true);
    setError(null);

    try {
      const result = await aiService.calculateDynamicPrice(tripDetails);
      setPricing(result);
    } catch (err) {
      setError('Failed to calculate dynamic pricing. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    calculatePricing();
  }, []);

  const handleInputChange = (field) => (event) => {
    setTripDetails({
      ...tripDetails,
      [field]: event.target.value,
    });
  };

  const getSurgeLevel = (multiplier) => {
    if (multiplier >= 2) return { level: 'Very High', color: 'error' };
    if (multiplier >= 1.5) return { level: 'High', color: 'error' };
    if (multiplier >= 1.2) return { level: 'Medium', color: 'warning' };
    return { level: 'Normal', color: 'success' };
  };

  const priceBreakdownData = pricing ? [
    { name: 'Base Fare', value: pricing.priceBreakdown.baseFare, color: COLORS[0] },
    { name: 'Distance', value: pricing.priceBreakdown.distanceRate, color: COLORS[1] },
    { name: 'Time', value: pricing.priceBreakdown.timeRate, color: COLORS[2] },
    { name: 'Surge', value: pricing.priceBreakdown.surge, color: COLORS[3] },
  ] : [];

  const factorIcons = {
    demand: <SurgeIcon />,
    weather: <WeatherIcon />,
    events: <EventIcon />,
    traffic: <TrafficIcon />,
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <PriceIcon sx={{ mr: 1 }} />
        AI Dynamic Pricing
      </Typography>

      {/* Trip Input */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Trip Details
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Pickup Location"
              value={tripDetails.pickup}
              onChange={handleInputChange('pickup')}
              variant="outlined"
              InputProps={{
                startAdornment: <LocationIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Destination"
              value={tripDetails.destination}
              onChange={handleInputChange('destination')}
              variant="outlined"
              InputProps={{
                startAdornment: <LocationIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Distance (km)"
              type="number"
              value={tripDetails.distance}
              onChange={handleInputChange('distance')}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Est. Time (min)"
              type="number"
              value={tripDetails.estimatedTime}
              onChange={handleInputChange('estimatedTime')}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={calculatePricing}
              disabled={isCalculating}
              sx={{ height: '56px' }}
            >
              {isCalculating ? 'Calculating...' : 'Calculate'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {isCalculating && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            AI Processing Pricing Factors...
          </Typography>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Analyzing demand patterns, traffic conditions, weather, local events, and market dynamics...
          </Typography>
        </Paper>
      )}

      {pricing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Grid container spacing={3}>
            {/* Main Price Display */}
            <Grid item xs={12} md={4}>
              <PriceCard surge={pricing.surgeMultiplier}>
                <Avatar
                  sx={{
                    bgcolor: getSurgeLevel(pricing.surgeMultiplier).color === 'error' ? 'error.main' : 
                             getSurgeLevel(pricing.surgeMultiplier).color === 'warning' ? 'warning.main' : 'success.main',
                    width: 60,
                    height: 60,
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <PriceIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h3" color="primary.main" gutterBottom>
                  ${pricing.finalPrice.toFixed(2)}
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Estimated Fare
                </Typography>
                <Chip
                  label={`${pricing.surgeMultiplier.toFixed(1)}x Surge`}
                  color={getSurgeLevel(pricing.surgeMultiplier).color}
                  sx={{ mt: 1 }}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {getSurgeLevel(pricing.surgeMultiplier).level} Demand
                </Typography>
              </PriceCard>
            </Grid>

            {/* Price Breakdown Chart */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Price Breakdown
                </Typography>
                <Box sx={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priceBreakdownData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                      >
                        {priceBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            {/* Pricing Factors */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  AI Pricing Factors
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(pricing.factors).map(([factor, value]) => (
                    <Grid item xs={12} sm={6} md={3} key={factor}>
                      <FactorCard>
                        <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                          {factorIcons[factor] || <SurgeIcon />}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                            {factor}
                          </Typography>
                          <Typography variant="h6" color="primary.main">
                            {value}
                          </Typography>
                        </Box>
                      </FactorCard>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>

            {/* Detailed Breakdown */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Fare Calculation Details
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Base Fare</Typography>
                        <Typography>${pricing.priceBreakdown.baseFare.toFixed(2)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Distance Rate ({tripDetails.distance} km)</Typography>
                        <Typography>${pricing.priceBreakdown.distanceRate.toFixed(2)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Time Rate ({tripDetails.estimatedTime} min)</Typography>
                        <Typography>${pricing.priceBreakdown.timeRate.toFixed(2)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Surge Pricing ({pricing.surgeMultiplier.toFixed(1)}x)</Typography>
                        <Typography>${pricing.priceBreakdown.surge.toFixed(2)}</Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                        <Typography variant="h6">Total Fare</Typography>
                        <Typography variant="h6" color="primary.main">
                          ${pricing.finalPrice.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        AI Pricing Algorithm
                      </Typography>
                      <Typography variant="body2">
                        Our AI considers real-time demand, traffic patterns, weather conditions, 
                        local events, and historical data to provide fair and dynamic pricing.
                      </Typography>
                    </Alert>
                    <Alert severity="success">
                      <Typography variant="body2">
                        This price is valid for the next 5 minutes and may change based on 
                        real-time conditions.
                      </Typography>
                    </Alert>
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

export default DynamicPricing;