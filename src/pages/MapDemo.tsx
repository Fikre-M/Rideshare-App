import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
  Alert,
  Chip,
} from '@mui/material';
import { Map as MapIcon } from '@mui/icons-material';
import RideMap from '../components/map/RideMap';
import { RouteOption, HeatmapPoint } from '../types/map';

const MapDemo: React.FC = () => {
  const [showLocationSearch, setShowLocationSearch] = useState(true);
  const [showRouting, setShowRouting] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showSimulatedDrivers, setShowSimulatedDrivers] = useState(true);
  const [showUserLocation, setShowUserLocation] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);

  // Generate sample heatmap data
  const generateHeatmapData = (): HeatmapPoint[] => {
    const center = [40.7128, -74.006]; // NYC
    const points: HeatmapPoint[] = [];

    for (let i = 0; i < 50; i++) {
      const latOffset = (Math.random() - 0.5) * 0.1;
      const lngOffset = (Math.random() - 0.5) * 0.1;
      
      points.push({
        lat: center[0] + latOffset,
        lng: center[1] + lngOffset,
        intensity: Math.random(),
      });
    }

    return points;
  };

  const [heatmapPoints] = useState<HeatmapPoint[]>(generateHeatmapData());

  const handleRouteSelect = (route: RouteOption) => {
    setSelectedRoute(route);
    console.log('Selected route:', route);
  };

  const handleLocationSelect = (
    type: 'pickup' | 'dropoff',
    lat: number,
    lng: number,
    address: string
  ) => {
    console.log(`${type} location selected:`, { lat, lng, address });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <MapIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="h3" gutterBottom>
              Interactive Map Demo
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Free OpenStreetMap integration with Leaflet.js - No API keys required!
            </Typography>
          </Box>
        </Box>

        <Alert severity="success" sx={{ mb: 2 }}>
          <strong>100% Free!</strong> This map uses OpenStreetMap tiles, Nominatim geocoding,
          and OSRM routing - all completely free with no API keys required.
        </Alert>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Controls Panel */}
        <Paper elevation={3} sx={{ p: 3, width: { xs: '100%', md: '300px' }, height: 'fit-content' }}>
          <Typography variant="h6" gutterBottom>
            Map Controls
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={showLocationSearch}
                  onChange={(e) => setShowLocationSearch(e.target.checked)}
                />
              }
              label="Location Search"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showRouting}
                  onChange={(e) => setShowRouting(e.target.checked)}
                />
              }
              label="Route Display"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showHeatmap}
                  onChange={(e) => setShowHeatmap(e.target.checked)}
                />
              }
              label="Demand Heatmap"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showSimulatedDrivers}
                  onChange={(e) => setShowSimulatedDrivers(e.target.checked)}
                />
              }
              label="Simulated Drivers"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showUserLocation}
                  onChange={(e) => setShowUserLocation(e.target.checked)}
                />
              }
              label="User Location"
            />
          </FormGroup>

          {selectedRoute && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Selected Route
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Chip
                  label={`Distance: ${(selectedRoute.distance / 1000).toFixed(2)} km`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={`Duration: ${Math.round(selectedRoute.duration / 60)} min`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                {selectedRoute.isAIRecommended && (
                  <Chip
                    label="AI Recommended"
                    size="small"
                    color="success"
                  />
                )}
              </Box>
            </>
          )}

          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary">
            <strong>Features:</strong>
            <br />
            • OpenStreetMap tiles (free)
            <br />
            • Nominatim geocoding (free)
            <br />
            • OSRM routing (free)
            <br />
            • Real-time driver simulation
            <br />
            • Demand heatmap visualization
            <br />
            • Dark mode support
          </Typography>
        </Paper>

        {/* Map */}
        <Box sx={{ flex: 1, minHeight: { xs: '500px', md: '70vh' } }}>
          <RideMap
            showLocationSearch={showLocationSearch}
            showRouting={showRouting}
            showHeatmap={showHeatmap}
            showSimulatedDrivers={showSimulatedDrivers}
            showUserLocation={showUserLocation}
            heatmapPoints={heatmapPoints}
            height="100%"
            onRouteSelect={handleRouteSelect}
            onLocationSelect={handleLocationSelect}
          />
        </Box>
      </Box>

      {/* Info Section */}
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          How to Use
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <li>
            <Typography variant="body2">
              <strong>Location Search:</strong> Type an address in the search boxes to find pickup
              and dropoff locations
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Routing:</strong> Select both pickup and dropoff to see route options with
              AI recommendations
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Drivers:</strong> Click on driver markers to see their details. Nearby
              drivers pulse with a green ring
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>Heatmap:</strong> Toggle the heatmap to visualize demand intensity across
              the area
            </Typography>
          </li>
          <li>
            <Typography variant="body2">
              <strong>User Location:</strong> Click the location button to center the map on your
              current position
            </Typography>
          </li>
        </Box>
      </Paper>
    </Container>
  );
};

export default MapDemo;
