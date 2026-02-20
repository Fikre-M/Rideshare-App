import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { DriverMarker, PassengerLocation } from '../../types/map';
import { useTheme } from '@mui/material/styles';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue with Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
});

// Custom car icon for drivers
const carIcon = new L.DivIcon({
  html: `
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H6.5C5.84 5 5.28 5.42 5.08 6.01L3 12V20C3 20.55 3.45 21 4 21H5C5.55 21 6 20.55 6 20V19H18V20C18 20.55 18.45 21 19 21H20C20.55 21 21 20.55 21 20V12L18.92 6.01ZM6.5 16C5.67 16 5 15.33 5 14.5S5.67 13 6.5 13 8 13.67 8 14.5 7.33 16 6.5 16ZM17.5 16C16.67 16 16 15.33 16 14.5S16.67 13 17.5 13 19 13.67 19 14.5 18.33 16 17.5 16ZM5 11L6.5 6.5H17.5L19 11H5Z" fill="#1976d2"/>
    </svg>
  `,
  className: 'car-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Custom pin icon for passenger
const passengerIcon = new L.DivIcon({
  html: `
    <svg width="32" height="40" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#f44336"/>
    </svg>
  `,
  className: 'passenger-marker',
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -40],
});

// Component to fit bounds when markers change
function FitBounds({ 
  driverMarkers, 
  passengerMarker 
}: { 
  driverMarkers: DriverMarker[]; 
  passengerMarker?: PassengerLocation;
}) {
  const map = useMap();

  useEffect(() => {
    const bounds: L.LatLngBoundsExpression = [];
    
    driverMarkers.forEach(driver => {
      bounds.push([driver.lat, driver.lng]);
    });
    
    if (passengerMarker) {
      bounds.push([passengerMarker.lat, passengerMarker.lng]);
    }

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [driverMarkers, passengerMarker, map]);

  return null;
}

interface MapViewProps {
  driverMarkers?: DriverMarker[];
  passengerMarker?: PassengerLocation;
  routePolyline?: [number, number][];
  center?: [number, number];
  zoom?: number;
  height?: string;
  children?: React.ReactNode;
}

const MapView: React.FC<MapViewProps> = ({
  driverMarkers = [],
  passengerMarker,
  routePolyline,
  center = [40.7128, -74.0060], // Default to NYC
  zoom = 13,
  height = '60vh',
  children,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());

  // Tile layer URL based on theme
  const tileUrl = isDarkMode
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const tileAttribution = isDarkMode
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <div style={{ height, width: '100%', position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution={tileAttribution}
          url={tileUrl}
          maxZoom={19}
        />

        {/* Driver markers */}
        {driverMarkers.map((driver) => (
          <Marker
            key={driver.id}
            position={[driver.lat, driver.lng]}
            icon={carIcon}
            ref={(ref) => {
              if (ref) {
                markerRefs.current.set(driver.id, ref);
              }
            }}
          >
            <Popup>
              <div style={{ minWidth: '150px' }}>
                <strong>{driver.name}</strong>
                <br />
                <span>⭐ {driver.rating.toFixed(1)}</span>
                <br />
                <span>🚗 {driver.vehicleType}</span>
                {driver.eta && (
                  <>
                    <br />
                    <span>🕐 {driver.eta} min away</span>
                  </>
                )}
                <br />
                <span style={{ color: driver.available ? 'green' : 'gray' }}>
                  {driver.available ? '✓ Available' : '✗ Busy'}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Passenger marker */}
        {passengerMarker && (
          <Marker
            position={[passengerMarker.lat, passengerMarker.lng]}
            icon={passengerIcon}
          >
            <Popup>
              <div>
                <strong>Your Location</strong>
                {passengerMarker.address && (
                  <>
                    <br />
                    <span>{passengerMarker.address}</span>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Route polyline */}
        {routePolyline && routePolyline.length > 0 && (
          <Polyline
            positions={routePolyline}
            color={theme.palette.primary.main}
            weight={4}
            opacity={0.7}
          />
        )}

        {/* Fit bounds to show all markers */}
        <FitBounds driverMarkers={driverMarkers} passengerMarker={passengerMarker} />

        {/* Additional children components */}
        {children}
      </MapContainer>

      <style>{`
        .car-marker {
          background: transparent;
          border: none;
          transition: transform 0.3s ease-in-out;
        }
        
        .car-marker:hover {
          transform: scale(1.2);
        }

        .passenger-marker {
          background: transparent;
          border: none;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .leaflet-container {
          font-family: 'Roboto', sans-serif;
        }

        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }

        .leaflet-popup-content {
          margin: 12px;
          font-size: 14px;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
};

export default MapView;
