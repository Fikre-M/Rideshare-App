import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  Chip,
  CircularProgress,
  Button,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  DirectionsCar as CarIcon,
  LocalTaxi as TaxiIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  MyLocation as MyLocationIcon,
  SwapVert as SwapIcon,
  Navigation as NavigationIcon,
} from '@mui/icons-material';
import { m } from 'framer-motion';
import OpenStreetMap from '../components/map/OpenStreetMap';
import VehicleMarker from '../components/map/VehicleMarker';

const MapView = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [mapCenter, setMapCenter] = useState([9.0054, 38.7636]); // Addis Ababa
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showRoutes, setShowRoutes] = useState(true);
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [routeActive, setRouteActive] = useState(false);

  // Simulate real-time vehicle data
  useEffect(() => {
    const generateVehicles = () => {
      const vehicleTypes = ['car', 'taxi', 'shuttle'];
      const statuses = ['available', 'busy', 'moving'];
      const driverNames = ['John Smith', 'Sarah Johnson', 'Mike Davis', 'Emily Brown', 'David Wilson'];
      
      const generatedVehicles = Array.from({ length: 8 }, (_, index) => ({
        id: `vehicle_${index + 1}`,
        name: driverNames[index % driverNames.length],
        type: vehicleTypes[index % vehicleTypes.length],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        position: [
          9.0054 + (Math.random() - 0.5) * 0.1, // Random position around Addis Ababa
          38.7636 + (Math.random() - 0.5) * 0.1,
        ],
        rating: 4.5 + Math.random() * 0.5,
        eta: Math.floor(Math.random() * 15) + 2, // 2-17 minutes
        distance: Math.random() * 5 + 0.5, // 0.5-5.5 km
        vehicleModel: `${['Toyota', 'Honda', 'Nissan'][index % 3]} ${['Camry', 'Accord', 'Altima'][index % 3]}`,
        licensePlate: `ABC-${1000 + index}`,
        pricePerKm: (1.5 + Math.random() * 2).toFixed(2),
        lastUpdate: new Date(),
      }));

      setVehicles(generatedVehicles);
      setIsLoading(false);
    };

    // Initial load
    generateVehicles();

    // Simulate real-time updates
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(vehicle => ({
        ...vehicle,
        position: [
          vehicle.position[0] + (Math.random() - 0.5) * 0.002,
          vehicle.position[1] + (Math.random() - 0.5) * 0.002,
        ],
        status: Math.random() > 0.7 ? 
          (vehicle.status === 'available' ? 'busy' : 'available') : 
          vehicle.status,
        eta: Math.max(1, vehicle.eta + (Math.random() - 0.5) * 2),
        lastUpdate: new Date(),
      })));
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const filteredVehicles = vehicles.filter(vehicle => {
    if (filter === 'all') return true;
    return vehicle.status === filter;
  });

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    setMapCenter(vehicle.position);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  const handleSwapLocations = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFromLocation(`Current Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`);
          setMapCenter([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Unable to get location:', error);
        }
      );
    }
  };

  const handleShowRoute = () => {
    if (fromLocation && toLocation) {
      setRouteActive(true);
      // In a real app, you would calculate and display the route here
    }
  };

  const handleClearRoute = () => {
    setFromLocation('');
    setToLocation('');
    setRouteActive(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      available: 'success',
      busy: 'warning',
      moving: 'info',
      offline: 'default',
    };
    return colors[status] || 'default';
  };

  const getStatusCount = (status) => {
    return vehicles.filter(v => v.status === status).length;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <LocationIcon sx={{ mr: 1 }} />
        Live Vehicle Tracking
      </Typography>

      <Grid container spacing={3}>
        {/* Map Section */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2, height: '600px' }}>
            {isLoading ? (
              <Box sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 2
              }}>
                <CircularProgress size={48} />
                <Typography variant="body1" color="text.secondary">
                  Loading vehicles...
                </Typography>
              </Box>
            ) : (
              <OpenStreetMap
                center={mapCenter}
                height="560px"
                markers={filteredVehicles.map(vehicle => ({
                  position: vehicle.position,
                  title: vehicle.name,
                  description: `${vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)} - ${vehicle.status}`,
                  extraInfo: {
                    Status: vehicle.status,
                    Rating: `⭐ ${vehicle.rating.toFixed(1)}`,
                    ETA: `${vehicle.eta} min`,
                    Distance: `${vehicle.distance.toFixed(1)} km`,
                  },
                  onClick: () => handleVehicleSelect(vehicle),
                }))}routes={showRoutes && filteredVehicles
                  .filter(v => v.status === 'moving')
                  .map(vehicle => ({
                    coordinates: [
                      vehicle.position,
                      [
                        vehicle.position[0] + (Math.random() - 0.5) * 0.01,
                        vehicle.position[1] + (Math.random() - 0.5) * 0.01,
                      ],
                    ],
                    color: getStatusColor(vehicle.status),
                    weight: 2,
                    opacity: 0.6,
                  }))}
              />
            )}
          </Paper>
        </Grid>

        {/* Control Panel */}
        <Grid item xs={12} lg={4}>
          {/* Status Overview */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Fleet Overview
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Available</Typography>
                <Chip label={getStatusCount('available')} color="success" size="small" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Busy</Typography>
                <Chip label={getStatusCount('busy')} color="warning" size="small" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Moving</Typography>
                <Chip label={getStatusCount('moving')} color="info" size="small" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2">Total</Typography>
                <Chip label={vehicles.length} color="primary" size="small" />
              </Box>
            </Box>
          </Paper>

          {/* Route Planning */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Route Planning
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="From"
                placeholder="Enter pickup location"
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon color="success" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleGetCurrentLocation}>
                        <MyLocationIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <IconButton size="small" onClick={handleSwapLocations}>
                  <SwapIcon />
                </IconButton>
              </Box>

              <TextField
                fullWidth
                size="small"
                label="To"
                placeholder="Enter destination"
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationIcon color="error" />
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  startIcon={<NavigationIcon />}
                  onClick={handleShowRoute}
                  disabled={!fromLocation || !toLocation}
                >
                  Show Route
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleClearRoute}
                  disabled={!fromLocation && !toLocation}
                >
                  Clear
                </Button>
              </Box>

              {routeActive && (
                <Chip
                  label="Route Active"
                  color="success"
                  size="small"
                  onDelete={handleClearRoute}
                />
              )}
            </Box>
          </Paper>

          {/* Filters */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="body2">Show Routes</Typography>
                <Switch
                  checked={showRoutes}
                  onChange={(e) => setShowRoutes(e.target.checked)}
                  size="small"
                />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>Status Filter</Typography>
                <Select
                  fullWidth
                  size="small"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <MenuItem value="all">All Vehicles</MenuItem>
                  <MenuItem value="available">Available Only</MenuItem>
                  <MenuItem value="busy">Busy Only</MenuItem>
                  <MenuItem value="moving">Moving Only</MenuItem>
                </Select>
              </Box>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                sx={{ mt: 1 }}
              >
                Refresh
              </Button>
            </Box>
          </Paper>

          {/* Selected Vehicle Details */}
          {selectedVehicle && (
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Selected Vehicle
                </Typography>
                <VehicleMarker 
                  vehicle={selectedVehicle}
                  showDetails={true}
                />
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => console.log('Book vehicle:', selectedVehicle)}
                  >
                    Book Now
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setSelectedVehicle(null)}
                  >
                    Close
                  </Button>
                </Box>
              </Paper>
            </m.div>
          )}

          {/* Legend */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Legend
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 16, 
                  height: 16, 
                  borderRadius: '50%', 
                  backgroundColor: '#4caf50' 
                }} />
                <Typography variant="caption">Available</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 16, 
                  height: 16, 
                  borderRadius: '50%', 
                  backgroundColor: '#ff9800' 
                }} />
                <Typography variant="caption">Busy</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 16, 
                  height: 16, 
                  borderRadius: '50%', 
                  backgroundColor: '#2196f3' 
                }} />
                <Typography variant="caption">Moving</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MapView;
