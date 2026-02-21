import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  FormControlLabel,
  Switch,
  LinearProgress,
} from '@mui/material';
import {
  AddLocation as PickupIcon,
  LocationOn as DestinationIcon,
  SwapHoriz as SwapIcon,
  Route as RouteIcon,
  Traffic as TrafficIcon,
  TrendingUp as OptimizeIcon,
} from '@mui/icons-material';
import { m } from 'framer-motion';
import OpenStreetMap from '../map/OpenStreetMap';
import RouteDisplay from '../map/RouteDisplay';
import aiService from '../../services/aiService';

const RouteOptimizer = () => {
  const [waypoints, setWaypoints] = useState(['', '']);
  const [preferences, setPreferences] = useState({
    prioritizeTime: true,
    avoidTolls: false,
    avoidHighways: false,
    ecoFriendly: false,
  });
  const [optimization, setOptimization] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState(null);

  const addWaypoint = () => {
    setWaypoints([...waypoints, '']);
  };

  const removeWaypoint = (index) => {
    if (waypoints.length > 2) {
      setWaypoints(waypoints.filter((_, i) => i !== index));
    }
  };

  const updateWaypoint = (index, value) => {
    const newWaypoints = [...waypoints];
    newWaypoints[index] = value;
    setWaypoints(newWaypoints);
  };

  const handlePreferenceChange = (key) => (event) => {
    setPreferences({
      ...preferences,
      [key]: event.target.checked,
    });
  };

  const optimizeRoute = async () => {
    const validWaypoints = waypoints.filter(wp => wp.trim());
    if (validWaypoints.length < 2) {
      setError('Please provide at least 2 waypoints');
      return;
    }

    setIsOptimizing(true);
    setError(null);

    try {
      const result = await aiService.optimizeRoute(validWaypoints, preferences);
      setOptimization(result);
    } catch (err) {
      setError('Failed to optimize route. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <OptimizeIcon sx={{ mr: 1 }} />
        AI Route Optimization
      </Typography>

      <Grid container spacing={3}>
        {/* Input Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Route Planning
            </Typography>

            {/* Waypoints */}
            <Box sx={{ mb: 3 }}>
              {waypoints.map((waypoint, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TextField
                    fullWidth
                    label={index === 0 ? 'Starting Point' : index === waypoints.length - 1 ? 'Destination' : `Stop ${index}`}
                    value={waypoint}
                    onChange={(e) => updateWaypoint(index, e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  {waypoints.length > 2 && index > 0 && index < waypoints.length - 1 && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => removeWaypoint(index)}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
              ))}
              
              <Button
                variant="outlined"
                size="small"
                onClick={addWaypoint}
                sx={{ mt: 1 }}
              >
                Add Stop
              </Button>
            </Box>

            {/* Preferences */}
            <Typography variant="subtitle2" gutterBottom>
              Optimization Preferences
            </Typography>
            <Box sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.prioritizeTime}
                    onChange={handlePreferenceChange('prioritizeTime')}
                  />
                }
                label="Prioritize Time"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.avoidTolls}
                    onChange={handlePreferenceChange('avoidTolls')}
                  />
                }
                label="Avoid Tolls"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.avoidHighways}
                    onChange={handlePreferenceChange('avoidHighways')}
                  />
                }
                label="Avoid Highways"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.ecoFriendly}
                    onChange={handlePreferenceChange('ecoFriendly')}
                  />
                }
                label="Eco-Friendly Route"
              />
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={optimizeRoute}
              disabled={isOptimizing}
              startIcon={<OptimizeIcon />}
            >
              {isOptimizing ? 'Optimizing...' : 'Optimize Route'}
            </Button>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Results Section */}
        <Grid item xs={12} md={6}>
          {isOptimizing && (
            <Paper sx={{ p: 3, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                AI Processing...
              </Typography>
              <LinearProgress sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Analyzing traffic patterns, calculating optimal routes, and considering your preferences...
              </Typography>
            </Paper>
          )}

          {optimization && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Optimized Route Results
                </Typography>

                {/* Route Metrics */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 1, backgroundColor: 'background.default', borderRadius: 1 }}>
                      <RouteIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Est. Time
                        </Typography>
                        <Typography variant="h6">
                          {optimization.estimatedTime} min
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 1, backgroundColor: 'background.default', borderRadius: 1 }}>
                      <RouteIcon sx={{ mr: 1, color: 'success.main' }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Distance
                        </Typography>
                        <Typography variant="h6">
                          {optimization.estimatedDistance} km
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                {/* Route Display on Map */}
                <Box sx={{ mt: 3 }}>
                  <RouteDisplay
                    routes={[
                      {
                        coordinates: [
                          [9.0054, 38.7636],
                          [9.0154, 38.7736]
                        ],
                        estimatedTime: optimization.estimatedTime,
                        estimatedDistance: optimization.estimatedDistance,
                        trafficConditions: optimization.trafficConditions,
                        fuelEfficiency: optimization.fuelEfficiency
                      }
                    ]}
                    height="300px"
                  />
                </Box>
              </Paper>
            </m.div>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default RouteOptimizer;
