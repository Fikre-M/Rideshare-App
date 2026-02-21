// import { useState, useEffect, useCallback } from 'react';
// import { Box, Typography, Paper, CircularProgress } from '@mui/material';
// import Map from 'react-map-gl';
// import { MapPin, Truck } from 'lucide-react';
// import { styled } from '@mui/material/styles';

// const MapContainer = styled(Paper)(({ theme }) => ({
//   height: '100%',
//   minHeight: 400,
//   borderRadius: theme.shape.borderRadius,
//   overflow: 'hidden',
//   position: 'relative',
// }));

// const MapLoading = styled(Box)(({ theme }) => ({
//   position: 'absolute',
//   top: 0,
//   left: 0,
//   right: 0,
//   bottom: 0,
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'center',
//   backgroundColor: 'rgba(255, 255, 255, 0.7)',
//   zIndex: 1,
// }));

// const VehicleMarker = styled(Box, {
//   shouldForwardProp: (prop) => prop !== 'status',
// })(({ status, theme }) => ({
//   position: 'relative',
//   color: 'white',
//   backgroundColor: 
//     status === 'available' ? theme.palette.success.main :
//     status === 'in-ride' ? theme.palette.primary.main :
//     status === 'offline' ? theme.palette.grey[500] :
//     theme.palette.warning.main,
//   borderRadius: '50%',
//   width: 24,
//   height: 24,
//   display: 'flex',
//   alignItems: 'center',
//   justifyContent: 'center',
//   cursor: 'pointer',
//   transform: 'translate(-50%, -50%)',
//   '&:hover': {
//     zIndex: 10,
//     '&::after': {
//       content: '""',
//       position: 'absolute',
//       width: 32,
//       height: 32,
//       borderRadius: '50%',
//       backgroundColor: 'currentColor',
//       opacity: 0.2,
//       zIndex: -1,
//     },
//   },
// }));

// // Mock data for vehicles
// const mockVehicles = [
//   {
//     id: 'v1',
//     lat: 9.0054,
//     lng: 38.7636,
//     status: 'available',
//     driver: 'John D.',
//     type: 'sedan',
//   },
//   {
//     id: 'v2',
//     lat: 9.0154,
//     lng: 38.7736,
//     status: 'in-ride',
//     driver: 'Jane S.',
//     type: 'suv',
//   },
//   {
//     id: 'v3',
//     lat: 8.9954,
//     lng: 38.7536,
//     status: 'maintenance',
//     driver: 'Mike T.',
//     type: 'van',
//   },
// ];

// const RealTimeMap = ({ height = 400, showControls = true }) => {
//   const [loading, setLoading] = useState(true);
//   const [vehicles, setVehicles] = useState([]);
//   const [selectedVehicle, setSelectedVehicle] = useState(null);
//   const [viewport, setViewport] = useState({
//     latitude: 9.0054,  // Default to Addis Ababa
//     longitude: 38.7636,
//     zoom: 12,
//   });

//   // Simulate real-time updates
//   useEffect(() => {
//     // Initial load
//     setVehicles(mockVehicles);
//     setLoading(false);

//     // Simulate vehicle movement
//     const interval = setInterval(() => {
//       setVehicles(currentVehicles => 
//         currentVehicles.map(vehicle => {
//           // Only move vehicles that are in-ride or available
//           if (vehicle.status === 'in-ride' || vehicle.status === 'available') {
//             const latOffset = (Math.random() - 0.5) * 0.01;
//             const lngOffset = (Math.random() - 0.5) * 0.01;
//             return {
//               ...vehicle,
//               lat: Math.min(Math.max(vehicle.lat + latOffset, 8.9), 9.1), // Keep within bounds
//               lng: Math.min(Math.max(vehicle.lng + lngOffset, 38.7), 38.8), // Keep within bounds
//               lastUpdate: new Date().toISOString(),
//             };
//           }
//           return vehicle;
//         })
//       );
//     }, 3000);

//     return () => clearInterval(interval);
//   }, []);

//   const handleMarkerClick = useCallback((vehicle) => {
//     setSelectedVehicle(vehicle);
//   }, []);

//   const handleViewportChange = useCallback((newViewport) => {
//     setViewport(newViewport);
//   }, []);

//   if (loading) {
//     return (
//       <MapContainer elevation={3}>
//         <MapLoading>
//           <CircularProgress size={40} />
//         </MapLoading>
//       </MapContainer>
//     );
//   }

//   return (
//     <MapContainer elevation={3} sx={{ height }}>
//       <Map
//         {...viewport}
//         style={{ width: '100%', height: '100%' }}
//         mapStyle="mapbox://styles/mapbox/streets-v11"
//         mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
//         onMove={evt => handleViewportChange(evt.viewState)}
//       >
//         {vehicles.map((vehicle) => (
//           <div
//             key={vehicle.id}
//             style={{
//               position: 'absolute',
//               left: '50%',
//               top: '50%',
//               transform: 'translate(-50%, -50%)',
//             }}
//             onClick={() => handleMarkerClick(vehicle)}
//           >
//             <VehicleMarker status={vehicle.status}>
//               <Truck size={14} />
//             </VehicleMarker>
//           </div>
//         ))}
//       </Map>

//       {selectedVehicle && (
//         <Paper
//           sx={{
//             position: 'absolute',
//             bottom: 16,
//             left: 16,
//             p: 2,
//             maxWidth: 300,
//             zIndex: 10,
//           }}
//           elevation={3}
//         >
//           <Box display="flex" alignItems="center" mb={1}>
//             <Truck size={20} style={{ marginRight: 8 }} />
//             <Typography variant="subtitle2">
//               {selectedVehicle.driver}
//             </Typography>
//           </Box>
//           <Typography variant="body2" color="text.secondary">
//             Status: {selectedVehicle.status}
//           </Typography>
//           <Typography variant="body2" color="text.secondary">
//             Vehicle: {selectedVehicle.type.toUpperCase()}
//           </Typography>
//           <Typography variant="caption" color="text.secondary">
//             Last updated: {new Date().toLocaleTimeString()}
//           </Typography>
//         </Paper>
//       )}
//     </MapContainer>
//   );
// };
// src/components/dashboard/RealTimeMap.jsx
import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Button, IconButton, Tooltip, Chip } from '@mui/material';
import { Truck, MapPin, RefreshCw, Info, X } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';

const RealTimeMap = ({ height = 400 }) => {
  const [showMap, setShowMap] = useState(false);
  const [vehicles, setVehicles] = useState([
    { id: 1, top: '30%', left: '20%', status: 'available', driver: 'John D.', type: 'Sedan', plate: 'ABC-123' },
    { id: 2, top: '50%', left: '60%', status: 'in-ride', driver: 'Jane S.', type: 'SUV', plate: 'XYZ-789' },
    { id: 3, top: '70%', left: '40%', status: 'offline', driver: 'Mike T.', type: 'Van', plate: 'DEF-456' },
    { id: 4, top: '25%', left: '80%', status: 'available', driver: 'Sarah L.', type: 'Sedan', plate: 'GHI-012' },
    { id: 5, top: '85%', left: '15%', status: 'maintenance', driver: 'Tom R.', type: 'Van', plate: 'JKL-345' },
  ]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isMoving, setIsMoving] = useState(false);

  // Simulate real-time vehicle movement
  useEffect(() => {
    if (!showMap || !isMoving) return;

    const interval = setInterval(() => {
      setVehicles(prevVehicles => 
        prevVehicles.map(vehicle => {
          if (vehicle.status === 'available' || vehicle.status === 'in-ride') {
            // Simulate small random movements
            const currentTop = parseFloat(vehicle.top);
            const currentLeft = parseFloat(vehicle.left);
            const newTop = Math.min(Math.max(currentTop + (Math.random() - 0.5) * 2, 5), 95);
            const newLeft = Math.min(Math.max(currentLeft + (Math.random() - 0.5) * 2, 5), 95);
            
            return {
              ...vehicle,
              top: `${newTop}%`,
              left: `${newLeft}%`,
              lastUpdate: new Date().toLocaleTimeString()
            };
          }
          return vehicle;
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [showMap, isMoving]);

  const handleVehicleClick = useCallback((vehicle) => {
    setSelectedVehicle(vehicle);
  }, []);

  const handleReset = useCallback(() => {
    setVehicles([
      { id: 1, top: '30%', left: '20%', status: 'available', driver: 'John D.', type: 'Sedan', plate: 'ABC-123' },
      { id: 2, top: '50%', left: '60%', status: 'in-ride', driver: 'Jane S.', type: 'SUV', plate: 'XYZ-789' },
      { id: 3, top: '70%', left: '40%', status: 'offline', driver: 'Mike T.', type: 'Van', plate: 'DEF-456' },
      { id: 4, top: '25%', left: '80%', status: 'available', driver: 'Sarah L.', type: 'Sedan', plate: 'GHI-012' },
      { id: 5, top: '85%', left: '15%', status: 'maintenance', driver: 'Tom R.', type: 'Van', plate: 'JKL-345' },
    ]);
    setSelectedVehicle(null);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#4caf50';
      case 'in-ride': return '#2196f3';
      case 'offline': return '#9e9e9e';
      case 'maintenance': return '#ff9800';
      default: return '#757575';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'available': return 'Available';
      case 'in-ride': return 'In Ride';
      case 'offline': return 'Offline';
      case 'maintenance': return 'Maintenance';
      default: return 'Unknown';
    }
  };

  // Simple fallback UI when no map is available
  if (!showMap) {
    return (
      <Paper
        sx={{
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          p: 3,
          bgcolor: 'background.paper',
        }}
        elevation={3}
      >
        <MapPin size={48} style={{ marginBottom: 16, color: '#666' }} />
        <Typography variant="h6" gutterBottom>
          Map Integration
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          To enable the interactive map, please provide a Mapbox access token.
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setShowMap(true)}
          startIcon={<Truck size={16} />}
          sx={{ mb: 2 }}
        >
          Show Static Preview
        </Button>
        <Typography variant="body2" color="text.secondary">
          Click to see a simulated vehicle tracking map with interactive features
        </Typography>
      </Paper>
    );
  }

  // Simple static map with vehicle markers (no external service)
  return (
    <Box
      sx={{
        height,
        position: 'relative',
        backgroundColor: '#f5f5f5',
        overflow: 'hidden',
        borderRadius: 2,
      }}
    >
      {/* Control Panel */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 20,
          display: 'flex',
          gap: 1,
        }}
      >
        <Tooltip title="Toggle Real-time Movement">
          <IconButton
            size="small"
            onClick={() => setIsMoving(!isMoving)}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
            }}
          >
            <RefreshCw size={16} className={isMoving ? 'animate-spin' : ''} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Reset Positions">
          <IconButton
            size="small"
            onClick={handleReset}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' },
            }}
          >
            <MapPin size={16} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Simple static map background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
          opacity: 0.8,
        }}
      />

      {/* Simple road lines */}
      {[...Array(5)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${20 + i * 20}%`,
            height: '4px',
            backgroundColor: '#757575',
            opacity: 0.3,
          }}
        />
      ))}

      {/* Vehicle markers */}
      {vehicles.map((vehicle) => (
        <m.div
          key={vehicle.id}
          style={{
            position: 'absolute',
            top: vehicle.top,
            left: vehicle.left,
            cursor: 'pointer',
          }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleVehicleClick(vehicle)}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: getStatusColor(vehicle.status),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              border: '2px solid white',
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: 'currentColor',
                opacity: 0.2,
                zIndex: -1,
              },
            }}
          >
            <Truck size={18} />
            {isMoving && (vehicle.status === 'available' || vehicle.status === 'in-ride') && (
              <Box
                sx={{
                  position: 'absolute',
                  top: -8,
                  right: -8,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#4caf50',
                  animation: 'pulse 2s infinite',
                }}
              />
            )}
          </Box>
        </m.div>
      ))}

      {/* Vehicle Status Legend */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 1,
          p: 2,
          boxShadow: 1,
          zIndex: 10,
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Vehicle Status
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {['available', 'in-ride', 'offline', 'maintenance'].map((status) => (
            <Box key={status} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: getStatusColor(status),
                }}
              />
              <Typography variant="caption">
                {getStatusLabel(status)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Selected Vehicle Popup */}
      <AnimatePresence>
        {selectedVehicle && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              right: 16,
              zIndex: 15,
            }}
          >
            <Paper
              sx={{
                p: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
              }}
              elevation={3}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Truck size={20} style={{ color: getStatusColor(selectedVehicle.status) }} />
                  <Typography variant="subtitle1" fontWeight="bold">
                    {selectedVehicle.driver}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => setSelectedVehicle(null)}
                  sx={{ p: 0.5 }}
                >
                  <X size={16} />
                </IconButton>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Chip
                  size="small"
                  label={getStatusLabel(selectedVehicle.status)}
                  sx={{
                    backgroundColor: getStatusColor(selectedVehicle.status),
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                />
                <Chip
                  size="small"
                  label={selectedVehicle.type}
                  variant="outlined"
                />
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Plate:</strong> {selectedVehicle.plate}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Vehicle ID:</strong> #{selectedVehicle.id.toString().padStart(3, '0')}
                </Typography>
                {selectedVehicle.lastUpdate && (
                  <Typography variant="caption" color="text.secondary">
                    Last updated: {selectedVehicle.lastUpdate}
                  </Typography>
                )}
              </Box>
            </Paper>
          </m.div>
        )}
      </AnimatePresence>

      {/* Info Panel */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 1,
          p: 1.5,
          boxShadow: 1,
          zIndex: 10,
          maxWidth: 200,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Info size={16} color="#666" />
          <Typography variant="caption" fontWeight="bold">
            Interactive Preview
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Click on vehicles to see details. Use controls to simulate movement.
        </Typography>
      </Box>
    </Box>
  );
};

export default RealTimeMap;