import React, { useState, useEffect } from 'react';
import { Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { DriverMarker } from '../../types/map';

// Custom car icon
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

interface SimulatedDriversProps {
  centerLocation: [number, number];
  passengerLocation?: [number, number];
  count?: number;
}

const SimulatedDrivers: React.FC<SimulatedDriversProps> = ({
  centerLocation,
  passengerLocation,
  count = 10,
}) => {
  const [drivers, setDrivers] = useState<DriverMarker[]>([]);

  // Generate initial drivers
  useEffect(() => {
    const vehicleTypes = ['Sedan', 'SUV', 'Compact', 'Luxury'];
    const names = [
      'John Smith',
      'Sarah Johnson',
      'Michael Chen',
      'Emily Davis',
      'David Wilson',
      'Lisa Anderson',
      'James Brown',
      'Maria Garcia',
      'Robert Taylor',
      'Jennifer Martinez',
      'William Lee',
      'Jessica White',
    ];

    const initialDrivers: DriverMarker[] = Array.from({ length: count }, (_, i) => {
      // Random offset within ~5km radius
      const latOffset = (Math.random() - 0.5) * 0.05;
      const lngOffset = (Math.random() - 0.5) * 0.05;

      return {
        id: `driver_${i}`,
        name: names[i % names.length],
        rating: 4.0 + Math.random() * 1.0, // 4.0 - 5.0
        lat: centerLocation[0] + latOffset,
        lng: centerLocation[1] + lngOffset,
        vehicleType: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
        available: Math.random() > 0.3, // 70% available
        eta: Math.floor(Math.random() * 15) + 2, // 2-17 minutes
      };
    });

    setDrivers(initialDrivers);
  }, [centerLocation, count]);

  // Simulate driver movement
  useEffect(() => {
    const interval = setInterval(() => {
      setDrivers((prevDrivers) =>
        prevDrivers.map((driver) => {
          // Small random movement (simulating GPS updates)
          const latChange = (Math.random() - 0.5) * 0.001; // ~100m
          const lngChange = (Math.random() - 0.5) * 0.001;

          return {
            ...driver,
            lat: driver.lat + latChange,
            lng: driver.lng + lngChange,
          };
        })
      );
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <>
      {drivers.map((driver) => {
        const isNearPassenger =
          passengerLocation &&
          calculateDistance(
            driver.lat,
            driver.lng,
            passengerLocation[0],
            passengerLocation[1]
          ) < 2; // Within 2km

        return (
          <React.Fragment key={driver.id}>
            <Marker
              position={[driver.lat, driver.lng]}
              icon={carIcon}
              eventHandlers={{
                click: () => {
                  console.log('Driver clicked:', driver.name);
                },
              }}
            >
              <Popup>
                <div style={{ minWidth: '150px' }}>
                  <strong>{driver.name}</strong>
                  <br />
                  <span>⭐ {driver.rating.toFixed(1)}</span>
                  <br />
                  <span>🚗 {driver.vehicleType}</span>
                  <br />
                  <span>🕐 {driver.eta} min away</span>
                  <br />
                  <span style={{ color: driver.available ? 'green' : 'gray' }}>
                    {driver.available ? '✓ Available' : '✗ Busy'}
                  </span>
                </div>
              </Popup>
            </Marker>

            {/* Pulse ring for nearby drivers */}
            {isNearPassenger && driver.available && (
              <Circle
                center={[driver.lat, driver.lng]}
                radius={100}
                pathOptions={{
                  color: '#4caf50',
                  fillColor: '#4caf50',
                  fillOpacity: 0.2,
                  weight: 2,
                  className: 'pulse-ring',
                }}
              />
            )}
          </React.Fragment>
        );
      })}

      <style>{`
        .pulse-ring {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.5);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .car-marker {
          transition: transform 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
};

export default SimulatedDrivers;
