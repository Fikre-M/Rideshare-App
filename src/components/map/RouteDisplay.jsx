import { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Paper, Collapse } from '@mui/material';
import { 
  Directions as RouteIcon,
  Timeline as TimelineIcon,
  Speed as SpeedIcon,
  AccessTime as TimeIcon,
  LocalGasStation as GasIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import OpenStreetMap from './OpenStreetMap';

const RouteDisplay = ({ 
  routes = [], 
  selectedRoute = null,
  onRouteSelect,
  showAlternatives = true,
  height = '400px',
  center = [9.0054, 38.7636]
}) => {
  const [expandedRoute, setExpandedRoute] = useState(null);

  const formatTime = (minutes) => {
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const formatDistance = (km) => {
    return `${km.toFixed(1)} km`;
  };

  const getRouteColor = (index, isSelected) => {
    if (isSelected) return '#1976d2';
    const colors = ['#ff9800', '#4caf50', '#9c27b0', '#f44336'];
    return colors[index % colors.length];
  };

  const createRouteMarkers = (route) => {
    const markers = [];
    
    // Start marker
    if (route.start) {
      markers.push({
        position: route.start,
        title: 'Start',
        description: route.startName || 'Starting point',
        icon: L.divIcon({
          html: `
            <div style="
              background-color: #4caf50;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              color: white;
              font-weight: bold;
              font-size: 12px;
            ">S</div>
          `,
          className: 'route-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      });
    }

    // End marker
    if (route.end) {
      markers.push({
        position: route.end,
        title: 'Destination',
        description: route.endName || 'Ending point',
        icon: L.divIcon({
          html: `
            <div style="
              background-color: #f44336;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              color: white;
              font-weight: bold;
              font-size: 12px;
            ">E</div>
          `,
          className: 'route-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      });
    }

    // Waypoint markers
    if (route.waypoints) {
      route.waypoints.forEach((waypoint, index) => {
        markers.push({
          position: waypoint,
          title: `Waypoint ${index + 1}`,
          description: `Stop ${index + 1}`,
          icon: L.divIcon({
            html: `
              <div style="
                background-color: #ff9800;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                color: white;
                font-weight: bold;
                font-size: 10px;
              ">${index + 1}</div>
            `,
            className: 'route-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          }),
        });
      });
    }

    return markers;
  };

  const RouteCard = ({ route, index, isSelected }) => {
    const isExpanded = expandedRoute === index;
    const color = getRouteColor(index, isSelected);

    return (
      <Paper
        elevation={isSelected ? 3 : 1}
        sx={{
          mb: 2,
          border: isSelected ? `2px solid ${color}` : '1px solid #ddd',
          borderRadius: 2,
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            elevation: 2,
            transform: 'translateY(-2px)',
          },
        }}
        onClick={() => onRouteSelect && onRouteSelect(route, index)}
      >
        {/* Route Header */}
        <Box sx={{ p: 2, backgroundColor: isSelected ? `${color}10` : 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <RouteIcon sx={{ mr: 1, color }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {route.name || `Route ${index + 1}`}
              </Typography>
              {route.isRecommended && (
                <Typography
                  variant="caption"
                  sx={{
                    ml: 2,
                    px: 1,
                    py: 0.5,
                    backgroundColor: color,
                    color: 'white',
                    borderRadius: 1,
                  }}
                >
                  RECOMMENDED
                </Typography>
              )}
            </Box>
            <IconButton size="small" onClick={(e) => {
              e.stopPropagation();
              setExpandedRoute(isExpanded ? null : index);
            }}>
              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>

          {/* Key Metrics */}
          <Box sx={{ display: 'flex', gap: 3, mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TimeIcon sx={{ mr: 0.5, fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2">
                {formatTime(route.estimatedTime)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <RouteIcon sx={{ mr: 0.5, fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2">
                {formatDistance(route.distance)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <GasIcon sx={{ mr: 0.5, fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2">
                {route.fuelEfficiency || 'N/A'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Expanded Details */}
        <Collapse in={isExpanded}>
          <Box sx={{ p: 2, borderTop: '1px solid #eee' }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Traffic Conditions
                </Typography>
                <Typography variant="body2">
                  {route.trafficConditions || 'Unknown'}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Road Type
                </Typography>
                <Typography variant="body2">
                  {route.roadType || 'Mixed'}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Toll Roads
                </Typography>
                <Typography variant="body2">
                  {route.hasTolls ? 'Yes' : 'No'}
                </Typography>
              </Box>
            </Box>

            {route.factors && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Route Factors
                </Typography>
                {Object.entries(route.factors).map(([key, value]) => (
                  <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {key.charAt(0).toUpperCase() + key.slice(1)}:
                    </Typography>
                    <Typography variant="body2">
                      {typeof value === 'number' ? value.toFixed(2) : value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Collapse>
      </Paper>
    );
  };

  return (
    <Box>
      {/* Map with Routes */}
      <OpenStreetMap
        center={center}
        height={height}
        markers={routes.length > 0 ? createRouteMarkers(selectedRoute || routes[0]) : []}
        routes={routes.map((route, index) => ({
          coordinates: route.coordinates || [route.start, route.end],
          color: getRouteColor(index, route === selectedRoute),
          weight: route === selectedRoute ? 6 : 4,
          opacity: route === selectedRoute ? 1 : 0.7,
          dashed: route !== selectedRoute,
        }))}
      />

      {/* Route Cards */}
      {showAlternatives && routes.length > 1 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Route Options
          </Typography>
          {routes.map((route, index) => (
            <RouteCard
              key={index}
              route={route}
              index={index}
              isSelected={route === selectedRoute}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default RouteDisplay;
