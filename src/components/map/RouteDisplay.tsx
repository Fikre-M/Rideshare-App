import React, { useState, useEffect } from 'react';
import { Polyline, useMap } from 'react-leaflet';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Route, Speed, Timer, Recommend } from '@mui/icons-material';
import { RouteOption, OSRMResponse } from '../../types/map';
import { useTheme } from '@mui/material/styles';

interface RouteDisplayProps {
  origin: [number, number];
  destination: [number, number];
  onRouteSelect?: (route: RouteOption) => void;
  aiRecommendedIndex?: number;
}

const RouteDisplay: React.FC<RouteDisplayProps> = ({
  origin,
  destination,
  onRouteSelect,
  aiRecommendedIndex = 0,
}) => {
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const map = useMap();

  useEffect(() => {
    fetchRoutes();
  }, [origin, destination]);

  const fetchRoutes = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson&alternatives=true`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch routes');
      }

      const data: OSRMResponse = await response.json();

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error('No routes found');
      }

      const parsedRoutes: RouteOption[] = data.routes.slice(0, 3).map((route, index) => ({
        coordinates: route.geometry.coordinates.map(
          (coord) => [coord[1], coord[0]] as [number, number]
        ),
        distance: route.distance,
        duration: route.duration,
        isAIRecommended: index === aiRecommendedIndex,
        geometry: route.geometry,
      }));

      setRoutes(parsedRoutes);
      setSelectedRouteIndex(aiRecommendedIndex);

      // Fit map to route bounds
      if (parsedRoutes.length > 0) {
        const bounds = parsedRoutes[0].coordinates;
        map.fitBounds(bounds, { padding: [50, 50] });
      }

      // Notify parent of selected route
      if (onRouteSelect && parsedRoutes[aiRecommendedIndex]) {
        onRouteSelect(parsedRoutes[aiRecommendedIndex]);
      }
    } catch (err) {
      console.error('Routing error:', err);
      setError('Failed to calculate routes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRouteClick = (index: number) => {
    setSelectedRouteIndex(index);
    if (onRouteSelect && routes[index]) {
      onRouteSelect(routes[index]);
    }
  };

  const formatDistance = (meters: number): string => {
    const km = meters / 1000;
    return km < 1 ? `${meters.toFixed(0)} m` : `${km.toFixed(2)} km`;
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <>
      {/* Render routes on map */}
      {routes.map((route, index) => {
        const isSelected = index === selectedRouteIndex;
        const isAIRecommended = route.isAIRecommended;
        
        return (
          <Polyline
            key={index}
            positions={route.coordinates}
            pathOptions={{
              color: isSelected
                ? theme.palette.primary.main
                : theme.palette.grey[400],
              weight: isSelected ? 5 : 3,
              opacity: isSelected ? 0.8 : 0.5,
              dashArray: isAIRecommended && isSelected ? '10, 10' : undefined,
              className: isAIRecommended && isSelected ? 'animated-dash' : undefined,
            }}
            eventHandlers={{
              click: () => handleRouteClick(index),
            }}
          />
        );
      })}

      {/* Route info panel */}
      {routes.length > 0 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            width: { xs: '90%', sm: '80%', md: '600px' },
            maxWidth: '100%',
          }}
        >
          <Paper elevation={4} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Route sx={{ mr: 1 }} />
              Route Options
            </Typography>

            <Grid container spacing={2}>
              {routes.map((route, index) => {
                const isSelected = index === selectedRouteIndex;
                const isAIRecommended = route.isAIRecommended;

                return (
                  <Grid item xs={12} sm={4} key={index}>
                    <Paper
                      elevation={isSelected ? 8 : 2}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        border: isSelected ? 2 : 1,
                        borderColor: isSelected
                          ? theme.palette.primary.main
                          : theme.palette.divider,
                        transition: 'all 0.3s',
                        '&:hover': {
                          elevation: 6,
                          transform: 'translateY(-2px)',
                        },
                      }}
                      onClick={() => handleRouteClick(index)}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Route {index + 1}
                        </Typography>
                        {isAIRecommended && (
                          <Chip
                            label="AI Recommended"
                            size="small"
                            color="success"
                            icon={<Recommend />}
                          />
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Speed sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {formatDistance(route.distance)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Timer sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {formatDuration(route.duration)}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Paper>
        </Box>
      )}

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }

        .animated-dash {
          animation: dash 1s linear infinite;
        }
      `}</style>
    </>
  );
};

export default RouteDisplay;
