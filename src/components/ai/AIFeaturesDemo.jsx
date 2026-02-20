import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  TextField,
  Grid,
  Chip,
  Paper,
  Divider,
} from '@mui/material';
import {
  Psychology,
  AttachMoney,
  Route,
  TrendingUp,
  Analytics,
  Refresh,
} from '@mui/icons-material';
import {
  useSmartMatching,
  useDynamicPricing,
  useRouteOptimization,
  useDemandPrediction,
  usePredictiveAnalytics,
  useTokenUsage,
} from '../../hooks/useAIFeatures';

const AIFeaturesDemo = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { usage, refreshUsage, resetUsage } = useTokenUsage();

  // Smart Matching
  const smartMatching = useSmartMatching({
    onSuccess: () => refreshUsage(),
  });

  const handleSmartMatching = () => {
    const mockDrivers = [
      {
        driverId: 'driver_001',
        driverName: 'John Smith',
        rating: 4.8,
        distance: 2.5,
        vehicleType: 'sedan',
        vehicle: 'Toyota Camry - ABC 123',
      },
      {
        driverId: 'driver_002',
        driverName: 'Sarah Johnson',
        rating: 4.9,
        distance: 3.2,
        vehicleType: 'suv',
        vehicle: 'Honda CR-V - XYZ 789',
      },
      {
        driverId: 'driver_003',
        driverName: 'Michael Chen',
        rating: 4.7,
        distance: 1.8,
        vehicleType: 'sedan',
        vehicle: 'Nissan Altima - DEF 456',
      },
    ];

    const preferences = {
      vehicleType: 'sedan',
      maxWaitTime: 10,
      preferredRating: 4.5,
    };

    smartMatching.mutate({ drivers: mockDrivers, passengerPreferences: preferences });
  };

  // Dynamic Pricing
  const pricingContext = {
    basePrice: 8.50,
    demandLevel: 'high',
    weather: 'rainy',
    timeOfDay: new Date().toLocaleTimeString(),
    events: 'Concert at stadium',
    traffic: 'heavy',
  };

  const { data: pricingData, isLoading: pricingLoading, refetch: refetchPricing } = useDynamicPricing(
    pricingContext,
    {
      enabled: false,
      onSuccess: () => refreshUsage(),
    }
  );

  // Route Optimization
  const { optimizeRoute, isOptimizing, error: routeError } = useRouteOptimization();
  const [routeResult, setRouteResult] = useState(null);

  const handleRouteOptimization = async () => {
    try {
      const origin = { lng: 38.7636, lat: 9.0054 }; // Addis Ababa
      const destination = { lng: 38.7969, lat: 9.0320 }; // Bole area
      
      const result = await optimizeRoute(origin, destination, {
        prioritize: 'time',
        avoidTolls: false,
      });
      
      setRouteResult(result);
      refreshUsage();
    } catch (err) {
      console.error('Route optimization failed:', err);
    }
  };

  // Demand Prediction
  const demandContext = {
    location: 'Downtown',
    weather: 'clear',
    temperature: 'warm',
    events: 'Weekend market',
    currentDemand: 'medium',
  };

  const { data: demandData, isLoading: demandLoading, refetch: refetchDemand } = useDemandPrediction(
    demandContext,
    {
      enabled: false,
      onSuccess: () => refreshUsage(),
    }
  );

  // Predictive Analytics
  const analyticsContext = {
    currentMetrics: {
      activeRides: 75,
      availableDrivers: 45,
      averageWaitTime: 5,
      currentRevenue: 15000,
    },
  };

  const { data: analyticsData, isLoading: analyticsLoading, refetch: refetchAnalytics } = usePredictiveAnalytics(
    analyticsContext,
    {
      enabled: false,
      onSuccess: () => refreshUsage(),
    }
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          AI Features Demo
        </Typography>
        
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Token Usage
          </Typography>
          <Typography variant="h6">
            {usage.total.toLocaleString()} tokens
          </Typography>
          <Button size="small" onClick={resetUsage} sx={{ mt: 1 }}>
            Reset
          </Button>
        </Paper>
      </Box>

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab icon={<Psychology />} label="Smart Matching" />
        <Tab icon={<AttachMoney />} label="Dynamic Pricing" />
        <Tab icon={<Route />} label="Route Optimization" />
        <Tab icon={<TrendingUp />} label="Demand Prediction" />
        <Tab icon={<Analytics />} label="Predictive Analytics" />
      </Tabs>

      {/* Smart Matching Tab */}
      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Smart Driver Matching
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              AI-powered driver matching based on proximity, rating, vehicle type, and availability.
            </Typography>

            <Button
              variant="contained"
              onClick={handleSmartMatching}
              disabled={smartMatching.isPending}
              startIcon={smartMatching.isPending ? <CircularProgress size={20} /> : <Psychology />}
            >
              Find Best Match
            </Button>

            {smartMatching.isError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {smartMatching.error.message}
              </Alert>
            )}

            {smartMatching.data && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Matched Drivers (Ranked)
                </Typography>
                {smartMatching.data.matches.map((match, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6">{match.driverName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {match.vehicle}
                        </Typography>
                        <Chip
                          label={`Match Score: ${match.matchScore}%`}
                          color={match.matchScore > 80 ? 'success' : 'primary'}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2">
                          <strong>ETA:</strong> {match.estimatedArrival} min
                        </Typography>
                        <Typography variant="body2">
                          <strong>Reasoning:</strong> {match.reasoning}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
                <Typography variant="caption" color="text.secondary">
                  Tokens used: {smartMatching.data.tokenUsage?.total_tokens || 0}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dynamic Pricing Tab */}
      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Dynamic Pricing
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              AI-calculated surge pricing based on demand, weather, events, and traffic.
            </Typography>

            <Button
              variant="contained"
              onClick={() => refetchPricing()}
              disabled={pricingLoading}
              startIcon={pricingLoading ? <CircularProgress size={20} /> : <AttachMoney />}
            >
              Calculate Price
            </Button>

            {pricingData && (
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                      <Typography variant="h3" color="primary">
                        ${pricingData.finalPrice?.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Surge: {pricingData.surgeMultiplier}x
                      </Typography>
                      <Chip
                        label={`${pricingData.confidence}% Confidence`}
                        color="success"
                        sx={{ mt: 1 }}
                      />
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Pricing Factors
                    </Typography>
                    {pricingData.breakdown && Object.entries(pricingData.breakdown).map(([key, value]) => (
                      <Typography key={key} variant="body2">
                        <strong>{key}:</strong> {typeof value === 'number' ? value.toFixed(2) : value}
                      </Typography>
                    ))}
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" paragraph>
                      <strong>Reasoning:</strong> {pricingData.reasoning}
                    </Typography>
                    {pricingData.recommendations && (
                      <>
                        <Typography variant="subtitle2" gutterBottom>
                          Recommendations:
                        </Typography>
                        {pricingData.recommendations.map((rec, i) => (
                          <Chip key={i} label={rec} size="small" sx={{ mr: 1, mb: 1 }} />
                        ))}
                      </>
                    )}
                  </Grid>
                </Grid>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Tokens used: {pricingData.tokenUsage?.total_tokens || 0}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Route Optimization Tab */}
      {activeTab === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Route Optimization
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Fetches real routes from Mapbox and uses AI to recommend the best option.
            </Typography>

            <Button
              variant="contained"
              onClick={handleRouteOptimization}
              disabled={isOptimizing}
              startIcon={isOptimizing ? <CircularProgress size={20} /> : <Route />}
            >
              Optimize Route
            </Button>

            {routeError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {routeError.message}
              </Alert>
            )}

            {routeResult && (
              <Box sx={{ mt: 3 }}>
                <Paper sx={{ p: 2, mb: 2, bgcolor: 'success.light' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Recommended Route
                  </Typography>
                  <Typography variant="body2">
                    <strong>Duration:</strong> {routeResult.recommendedRoute.durationMinutes} min
                  </Typography>
                  <Typography variant="body2">
                    <strong>Distance:</strong> {routeResult.recommendedRoute.distanceKm} km
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Reasoning:</strong> {routeResult.recommendation.reasoning}
                  </Typography>
                </Paper>

                <Typography variant="subtitle2" gutterBottom>
                  All Routes
                </Typography>
                {routeResult.routes.map((route, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 1 }}>
                    <Typography variant="body2">
                      Route {index + 1}: {route.durationMinutes} min, {route.distanceKm} km
                    </Typography>
                  </Paper>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Demand Prediction Tab */}
      {activeTab === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Demand Prediction
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              AI-powered demand forecasting for the next 6 hours.
            </Typography>

            <Button
              variant="contained"
              onClick={() => refetchDemand()}
              disabled={demandLoading}
              startIcon={demandLoading ? <CircularProgress size={20} /> : <TrendingUp />}
            >
              Predict Demand
            </Button>

            {demandData && (
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  {demandData.predictions?.map((pred, index) => (
                    <Grid item xs={6} md={2} key={index}>
                      <Paper sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          Hour {index + 1}
                        </Typography>
                        <Typography variant="h6">{pred.demandScore}</Typography>
                        <Chip
                          label={pred.demandLevel}
                          size="small"
                          color={pred.demandLevel === 'high' ? 'error' : 'primary'}
                        />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                {demandData.insights && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Insights
                    </Typography>
                    {demandData.insights.map((insight, i) => (
                      <Alert key={i} severity="info" sx={{ mb: 1 }}>
                        {insight}
                      </Alert>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Predictive Analytics Tab */}
      {activeTab === 4 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Predictive Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Comprehensive business analytics and forecasting.
            </Typography>

            <Button
              variant="contained"
              onClick={() => refetchAnalytics()}
              disabled={analyticsLoading}
              startIcon={analyticsLoading ? <CircularProgress size={20} /> : <Analytics />}
            >
              Generate Analytics
            </Button>

            {analyticsData && (
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Today's Revenue
                      </Typography>
                      <Typography variant="h4">
                        ${analyticsData.revenueForecast?.today?.toLocaleString()}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        This Week
                      </Typography>
                      <Typography variant="h4">
                        ${analyticsData.revenueForecast?.thisWeek?.toLocaleString()}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        This Month
                      </Typography>
                      <Typography variant="h4">
                        ${analyticsData.revenueForecast?.thisMonth?.toLocaleString()}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {analyticsData.insights && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Key Insights
                    </Typography>
                    {analyticsData.insights.map((insight, i) => (
                      <Alert key={i} severity="info" sx={{ mb: 1 }}>
                        {insight}
                      </Alert>
                    ))}
                  </Box>
                )}

                {analyticsData.recommendations && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Recommendations
                    </Typography>
                    {analyticsData.recommendations.map((rec, i) => (
                      <Chip key={i} label={rec} sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AIFeaturesDemo;
