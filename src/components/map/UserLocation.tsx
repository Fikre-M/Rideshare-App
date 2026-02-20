import React, { useEffect, useState } from 'react';
import { Marker, Circle, useMap } from 'react-leaflet';
import { IconButton, Paper, Tooltip } from '@mui/material';
import { MyLocation } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import L from 'leaflet';

// Custom "You are here" icon
const userLocationIcon = new L.DivIcon({
  html: `
    <div class="user-location-marker">
      <div class="pulse-dot"></div>
    </div>
  `,
  className: 'user-location-icon',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface UserLocationProps {
  onLocationFound?: (lat: number, lng: number) => void;
  defaultLocation?: [number, number];
}

const UserLocation: React.FC<UserLocationProps> = ({
  onLocationFound,
  defaultLocation = [40.7128, -74.006], // NYC default
}) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const map = useMap();

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation([lat, lng]);
          setLocationDenied(false);
          
          // Center map on user location
          map.setView([lat, lng], 14, { animate: true });
          
          if (onLocationFound) {
            onLocationFound(lat, lng);
          }

          toast.success('Location found!');
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationDenied(true);
          
          // Use default location
          setUserLocation(defaultLocation);
          map.setView(defaultLocation, 13, { animate: true });
          
          if (onLocationFound) {
            onLocationFound(defaultLocation[0], defaultLocation[1]);
          }

          toast.error(
            'Location access denied. Using default location (New York City).',
            { duration: 4000 }
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser.');
      setUserLocation(defaultLocation);
      map.setView(defaultLocation, 13);
      
      if (onLocationFound) {
        onLocationFound(defaultLocation[0], defaultLocation[1]);
      }
    }
  };

  const handleLocateMe = () => {
    requestLocation();
  };

  return (
    <>
      {/* User location marker */}
      {userLocation && (
        <>
          <Marker position={userLocation} icon={userLocationIcon}>
            {/* Popup can be added here if needed */}
          </Marker>
          
          {/* Accuracy circle */}
          <Circle
            center={userLocation}
            radius={50}
            pathOptions={{
              color: '#2196f3',
              fillColor: '#2196f3',
              fillOpacity: 0.1,
              weight: 1,
            }}
          />
        </>
      )}

      {/* Locate Me button */}
      <Paper
        sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
        }}
        elevation={3}
      >
        <Tooltip title="Locate Me">
          <IconButton onClick={handleLocateMe} color="primary">
            <MyLocation />
          </IconButton>
        </Tooltip>
      </Paper>

      <style>{`
        .user-location-icon {
          background: transparent;
          border: none;
        }

        .user-location-marker {
          position: relative;
          width: 20px;
          height: 20px;
        }

        .pulse-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 12px;
          height: 12px;
          background: #2196f3;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.7);
          animation: pulse-blue 2s infinite;
        }

        @keyframes pulse-blue {
          0% {
            box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(33, 150, 243, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(33, 150, 243, 0);
          }
        }
      `}</style>
    </>
  );
};

export default UserLocation;
