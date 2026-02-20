import React, { useState, Suspense, lazy } from 'react';
import { Box, CircularProgress, Paper, Typography } from '@mui/material';
import { DriverMarker, PassengerLocation, RouteOption, HeatmapPoint } from '../../types/map';
import 'leaflet/dist/leaflet.css';

// Lazy load map components for better performance
const MapView = lazy(() => import('./MapView'));
const LocationSearch = lazy(() => import('./LocationSearch'));
const RouteDisplay = lazy(() => import('./RouteDisplay'));
const DemandHeatmap = lazy(() => import('./DemandHeatmap'));
const SimulatedDrivers = lazy(() => import('./SimulatedDrivers'));
const UserLocation = lazy(() => import('./UserLocation'));

interface RideMapProps {
  showLocationSearch?: boolean;
  showRouting?: boolean;
  showHeatmap?: boolean;
  showSimulatedDrivers?: boolean;
  showUserLocation?: boolean;
  driverMarkers?: DriverMarker[];
  heatmapPoints?: HeatmapPoint[];
  height?: string;
  onRouteSelect?: (route: RouteOption) => void;
  onLocationSelect?: (type: 'pickup' | 'dropoff', lat: number, lng: number, address: string) => void;
}

const RideMap: React.FC<RideMapProps> = ({
  showLocationSearch = true,
  showRouting = false,
  showHeatmap = false,
  showSimulatedDrivers = true,
  showUserLocation = true,
  driverMarkers = [],
  heatmapPoints = [],
  height = '60vh',
  onRouteSelect,
  onLocationSelect,
}) => {
  const [pickupLocation, setPickupLocation] = useState<PassengerLocation | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<PassengerLocation | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>([40.7128, -74.006]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.006]);

  // SSR safety check
  if (typeof window === 'undefined') {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
        }}
      >
        <Typography>Loading map...</Typography>
      </Box>
    );
  }

  const handlePickupSelect = (lat: number, lng: number, address: string) => {
    setPickupLocation({ lat, lng, address });
    setMapCenter([lat, lng]);
    
    if (onLocationSelect) {
      onLocationSelect('pickup', lat, lng, address);
    }
  };

  const handleDropoffSelect = (lat: number, lng: number, address: string) => {
    setDropoffLocation({ lat, lng, address });
    
    if (onLocationSelect) {
      onLocationSelect('dropoff', lat, lng, address);
    }
  };

  const handleUserLocationFound = (lat: number, lng: number) => {
    setUserLocation([lat, lng]);
    setMapCenter([lat, lng]);
  };

  // Responsive height
  const responsiveHeight = {
    xs: '100vh',
    sm: '100vh',
    md: height,
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Location Search Inputs */}
      {showLocationSearch && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 1000,
            p: 2,
            width: { xs: 'calc(100% - 32px)', sm: '400px' },
            maxWidth: '100%',
          }}
        >
          <Suspense fallback={<CircularProgress size={20} />}>
            <LocationSearch
              label="Pickup Location"
              placeholder="Enter pickup address..."
              onLocationSelect={handlePickupSelect}
            />
            <LocationSearch
              label="Dropoff Location"
              placeholder="Enter dropoff address..."
              onLocationSelect={handleDropoffSelect}
            />
          </Suspense>
        </Paper>
      )}

      {/* Map Container */}
      <Suspense
        fallback={
          <Box
            sx={{
              height: responsiveHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.100',
            }}
          >
            <CircularProgress />
          </Box>
        }
      >
        <Box sx={{ height: responsiveHeight }}>
          <MapView
            center={mapCenter}
            zoom={13}
            height="100%"
            driverMarkers={driverMarkers}
            passengerMarker={pickupLocation || undefined}
          >
            {/* User Location */}
            {showUserLocation && (
              <UserLocation
                onLocationFound={handleUserLocationFound}
                defaultLocation={mapCenter}
              />
            )}

            {/* Simulated Drivers */}
            {showSimulatedDrivers && (
              <SimulatedDrivers
                centerLocation={userLocation}
                passengerLocation={pickupLocation ? [pickupLocation.lat, pickupLocation.lng] : undefined}
                count={10}
              />
            )}

            {/* Route Display */}
            {showRouting && pickupLocation && dropoffLocation && (
              <RouteDisplay
                origin={[pickupLocation.lat, pickupLocation.lng]}
                destination={[dropoffLocation.lat, dropoffLocation.lng]}
                onRouteSelect={onRouteSelect}
                aiRecommendedIndex={0}
              />
            )}

            {/* Demand Heatmap */}
            {showHeatmap && heatmapPoints.length > 0 && (
              <DemandHeatmap heatmapPoints={heatmapPoints} visible={true} />
            )}
          </MapView>
        </Box>
      </Suspense>
    </Box>
  );
};

export default RideMap;
