import { useState } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { DirectionsCar, LocalTaxi, AirportShuttle } from '@mui/icons-material';
import L from 'leaflet';

// Custom vehicle icons
const createVehicleIcon = (type, status = 'available') => {
  const colors = {
    available: '#4caf50',
    busy: '#ff9800',
    offline: '#9e9e9e',
    moving: '#2196f3',
  };

  const icons = {
    car: DirectionsCar,
    taxi: LocalTaxi,
    shuttle: AirportShuttle,
  };

  const IconComponent = icons[type] || icons.car;
  const color = colors[status] || colors.available;

  // Create custom div icon
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="${getIconPath(type)}"/>
        </svg>
      </div>
    `,
    className: 'vehicle-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const getIconPath = (type) => {
  const paths = {
    car: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z',
    taxi: 'M1 11v10h5v-6h4v6h5V11L8 4l-7 7zm9.5-1c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zm-7 0c0-.83.67-1.5 1.5-1.5S6 9.17 6 10s-.67 1.5-1.5 1.5S3 10.83 3 10z',
    shuttle: 'M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-1.11-.89-2-2-2H5c-1.11 0-2 .89-2 2v10zm2-8h12v8H6V8z',
  };
  return paths[type] || paths.car;
};

const VehicleMarker = ({ 
  vehicle, 
  onClick, 
  showDetails = true,
  size = 'medium' 
}) => {
  const [icon, setIcon] = useState(null);

  useEffect(() => {
    const vehicleIcon = createVehicleIcon(vehicle.type, vehicle.status);
    setIcon(vehicleIcon);
  }, [vehicle.type, vehicle.status]);

  const getStatusColor = (status) => {
    const colors = {
      available: 'success',
      busy: 'warning',
      offline: 'default',
      moving: 'info',
    };
    return colors[status] || 'default';
  };

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  return (
    <Box
      sx={{
        p: 2,
        minWidth: 250,
        maxWidth: 300,
      }}
    >
      {/* Vehicle Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ mr: 2 }}>
          {vehicle.type === 'taxi' && <LocalTaxi color="primary" />}
          {vehicle.type === 'car' && <DirectionsCar color="primary" />}
          {vehicle.type === 'shuttle' && <AirportShuttle color="primary" />}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {vehicle.name || `Vehicle ${vehicle.id}`}
          </Typography>
          <Chip
            label={vehicle.status}
            size="small"
            color={getStatusColor(vehicle.status)}
            sx={{ mt: 0.5 }}
          />
        </Box>
      </Box>

      {/* Vehicle Details */}
      {showDetails && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" display="block" sx={{ mb: 1 }}>
            <strong>Driver:</strong> {vehicle.driverName || 'N/A'}
          </Typography>
          
          {vehicle.rating && (
            <Typography variant="body2" display="block" sx={{ mb: 1 }}>
              <strong>Rating:</strong> ⭐ {vehicle.rating.toFixed(1)}
            </Typography>
          )}

          {vehicle.eta && (
            <Typography variant="body2" display="block" sx={{ mb: 1 }}>
              <strong>ETA:</strong> {formatTime(vehicle.eta)}
            </Typography>
          )}

          {vehicle.distance && (
            <Typography variant="body2" display="block" sx={{ mb: 1 }}>
              <strong>Distance:</strong> {vehicle.distance.toFixed(1)} km
            </Typography>
          )}

          {vehicle.vehicleModel && (
            <Typography variant="body2" display="block" sx={{ mb: 1 }}>
              <strong>Vehicle:</strong> {vehicle.vehicleModel}
            </Typography>
          )}

          {vehicle.licensePlate && (
            <Typography variant="body2" display="block" sx={{ mb: 1 }}>
              <strong>License:</strong> {vehicle.licensePlate}
            </Typography>
          )}

          {vehicle.pricePerKm && (
            <Typography variant="body2" display="block" sx={{ mb: 1 }}>
              <strong>Rate:</strong> ${vehicle.pricePerKm}/km
            </Typography>
          )}
        </Box>
      )}

      {/* Action Buttons */}
      {onClick && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <button
            onClick={() => onClick(vehicle)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Select Vehicle
          </button>
        </Box>
      )}
    </Box>
  );
};

export default VehicleMarker;
