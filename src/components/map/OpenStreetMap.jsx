import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Box, Typography, CircularProgress } from '@mui/material';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom components
const MapController = ({ center, zoom, bounds }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds);
    }
  }, [bounds, map]);

  return null;
};

const OpenStreetMap = ({
  center = [9.0054, 38.7636], // Default: Addis Ababa
  zoom = 13,
  height = '400px',
  markers = [],
  routes = [],
  onMapClick,
  onMarkerClick,
  showControls = true,
  className = '',
}) => {
  const [isReady, setIsReady] = useState(false);
  const mapRef = useRef();

  useEffect(() => {
    // Small delay to ensure map container is ready
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: 2,
        }}
        className={className}
      >
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading map...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height,
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid #ddd',
      }}
      className={className}
    >
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        onClick={onMapClick}
      >
        {/* OpenStreetMap Tiles - 100% Free */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Map Controller for programmatic control */}
        <MapController center={center} zoom={zoom} />

        {/* Route Lines */}
        {routes.map((route, index) => (
          <Polyline
            key={`route-${index}`}
            positions={route.coordinates}
            color={route.color || '#1976d2'}
            weight={route.weight || 4}
            opacity={route.opacity || 0.8}
            dashArray={route.dashed ? '10, 10' : null}
          />
        ))}

        {/* Markers */}
        {markers.map((marker, index) => (
          <Marker
            key={`marker-${index}`}
            position={marker.position}
            icon={marker.icon}
            eventHandlers={{
              click: () => onMarkerClick && onMarkerClick(marker, index),
            }}
          >
            <Popup>
              <Box sx={{ p: 1, minWidth: 200 }}>
                {marker.title && (
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {marker.title}
                  </Typography>
                )}
                {marker.description && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {marker.description}
                  </Typography>
                )}
                {marker.extraInfo && Object.entries(marker.extraInfo).map(([key, value]) => (
                  <Typography key={key} variant="caption" display="block">
                    <strong>{key}:</strong> {value}
                  </Typography>
                ))}
              </Box>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
};

export default OpenStreetMap;
