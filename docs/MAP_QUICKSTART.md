# Map Integration Quick Start

## 🎉 What's Included

Complete free map solution with:
- ✅ OpenStreetMap tiles (no API key)
- ✅ Nominatim geocoding (no API key)
- ✅ OSRM routing (no API key)
- ✅ Real-time driver simulation
- ✅ Demand heatmap visualization
- ✅ Dark mode support
- ✅ TypeScript support

## 🚀 Quick Start (3 Steps)

### 1. Packages Already Installed ✅

```bash
✓ leaflet@1.9.4
✓ react-leaflet@4.2.1
✓ leaflet-routing-machine
✓ leaflet.heat
✓ @types/leaflet
```

### 2. Import and Use

```tsx
import RideMap from './components/map/RideMap';

function App() {
  return (
    <div>
      <h1>My Rideshare App</h1>
      <RideMap />
    </div>
  );
}
```

### 3. Test It!

```bash
npm run dev
```

Navigate to your app and you'll see a fully functional map!

## 📍 Basic Examples

### Example 1: Simple Map

```tsx
import RideMap from './components/map/RideMap';

function SimpleMap() {
  return <RideMap />;
}
```

### Example 2: With Location Search

```tsx
import RideMap from './components/map/RideMap';

function MapWithSearch() {
  return (
    <RideMap
      showLocationSearch={true}
      showRouting={true}
    />
  );
}
```

### Example 3: With Custom Drivers

```tsx
import RideMap from './components/map/RideMap';
import { DriverMarker } from './types/map';

function MapWithDrivers() {
  const drivers: DriverMarker[] = [
    {
      id: 'driver_1',
      name: 'John Smith',
      rating: 4.8,
      lat: 40.7128,
      lng: -74.0060,
      vehicleType: 'Sedan',
      available: true,
      eta: 5,
    },
  ];

  return (
    <RideMap
      driverMarkers={drivers}
      showSimulatedDrivers={false}
    />
  );
}
```

### Example 4: With Heatmap

```tsx
import RideMap from './components/map/RideMap';
import { HeatmapPoint } from './types/map';

function MapWithHeatmap() {
  const heatmapPoints: HeatmapPoint[] = [
    { lat: 40.7128, lng: -74.0060, intensity: 0.8 },
    { lat: 40.7580, lng: -73.9855, intensity: 0.6 },
    { lat: 40.7489, lng: -73.9680, intensity: 0.9 },
  ];

  return (
    <RideMap
      showHeatmap={true}
      heatmapPoints={heatmapPoints}
    />
  );
}
```

### Example 5: With Callbacks

```tsx
import RideMap from './components/map/RideMap';
import { RouteOption } from './types/map';

function InteractiveMap() {
  const handleRouteSelect = (route: RouteOption) => {
    console.log('Distance:', route.distance, 'meters');
    console.log('Duration:', route.duration, 'seconds');
    alert(`Route: ${(route.distance / 1000).toFixed(2)} km`);
  };

  const handleLocationSelect = (
    type: 'pickup' | 'dropoff',
    lat: number,
    lng: number,
    address: string
  ) => {
    console.log(`${type}:`, address);
  };

  return (
    <RideMap
      onRouteSelect={handleRouteSelect}
      onLocationSelect={handleLocationSelect}
    />
  );
}
```

## 🎨 Customization

### Change Map Height

```tsx
<RideMap height="80vh" />  // Desktop
<RideMap height="100vh" /> // Full screen
```

### Toggle Features

```tsx
<RideMap
  showLocationSearch={true}   // Show search boxes
  showRouting={true}          // Show route options
  showHeatmap={false}         // Hide heatmap
  showSimulatedDrivers={true} // Show moving drivers
  showUserLocation={true}     // Show "locate me" button
/>
```

## 🗺️ Demo Page

A complete demo page is available at `src/pages/MapDemo.tsx`:

```tsx
import MapDemo from './pages/MapDemo';

// Add to your routes
<Route path="/map-demo" element={<MapDemo />} />
```

Features:
- Interactive controls to toggle features
- Live route selection
- Heatmap visualization
- Simulated driver movement
- Usage instructions

## 📦 Component Structure

```
RideMap (Main Component)
├── MapView (Core Leaflet map)
├── LocationSearch (Geocoding)
├── RouteDisplay (Routing)
├── DemandHeatmap (Heatmap layer)
├── SimulatedDrivers (Driver markers)
└── UserLocation (Geolocation)
```

## 🔧 Props Reference

### RideMap Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showLocationSearch` | boolean | `true` | Show pickup/dropoff search |
| `showRouting` | boolean | `false` | Show route options |
| `showHeatmap` | boolean | `false` | Show demand heatmap |
| `showSimulatedDrivers` | boolean | `true` | Show simulated drivers |
| `showUserLocation` | boolean | `true` | Show locate me button |
| `driverMarkers` | DriverMarker[] | `[]` | Custom driver markers |
| `heatmapPoints` | HeatmapPoint[] | `[]` | Heatmap data points |
| `height` | string | `'60vh'` | Map container height |
| `onRouteSelect` | function | - | Route selection callback |
| `onLocationSelect` | function | - | Location selection callback |

## 🎯 Common Use Cases

### Use Case 1: Ride Booking Flow

```tsx
function RideBooking() {
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const handleLocationSelect = (type, lat, lng, address) => {
    if (type === 'pickup') {
      setPickup({ lat, lng, address });
    } else {
      setDropoff({ lat, lng, address });
    }
  };

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
  };

  return (
    <div>
      <RideMap
        showLocationSearch={true}
        showRouting={true}
        onLocationSelect={handleLocationSelect}
        onRouteSelect={handleRouteSelect}
      />
      
      {selectedRoute && (
        <div>
          <h3>Trip Summary</h3>
          <p>Distance: {(selectedRoute.distance / 1000).toFixed(2)} km</p>
          <p>Duration: {Math.round(selectedRoute.duration / 60)} min</p>
          <button>Book Ride</button>
        </div>
      )}
    </div>
  );
}
```

### Use Case 2: Driver Tracking

```tsx
function DriverTracking({ driverId }) {
  const [driverLocation, setDriverLocation] = useState(null);

  useEffect(() => {
    // Fetch driver location from API
    const interval = setInterval(async () => {
      const location = await fetchDriverLocation(driverId);
      setDriverLocation(location);
    }, 5000);

    return () => clearInterval(interval);
  }, [driverId]);

  const drivers = driverLocation ? [{
    id: driverId,
    name: 'Your Driver',
    rating: 4.9,
    lat: driverLocation.lat,
    lng: driverLocation.lng,
    vehicleType: 'Sedan',
    available: false,
    eta: 3,
  }] : [];

  return (
    <RideMap
      driverMarkers={drivers}
      showSimulatedDrivers={false}
      showUserLocation={true}
    />
  );
}
```

### Use Case 3: Demand Analysis

```tsx
function DemandAnalysis() {
  const [demandData, setDemandData] = useState([]);

  useEffect(() => {
    // Fetch demand data from AI service
    fetchDemandPrediction().then(data => {
      const heatmapPoints = data.predictions.map(p => ({
        lat: p.location.lat,
        lng: p.location.lng,
        intensity: p.demandScore / 100,
      }));
      setDemandData(heatmapPoints);
    });
  }, []);

  return (
    <RideMap
      showHeatmap={true}
      heatmapPoints={demandData}
      showSimulatedDrivers={true}
    />
  );
}
```

## 🌙 Dark Mode

Dark mode is automatically supported! The map switches to CartoDB dark tiles when your Material UI theme is in dark mode.

```tsx
import { ThemeProvider, createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <RideMap /> {/* Automatically uses dark tiles */}
    </ThemeProvider>
  );
}
```

## 📱 Mobile Responsive

The map is fully responsive:
- Mobile: Full screen height (100vh)
- Tablet: Adapts to screen size
- Desktop: Configurable height (default 60vh)

Search panel automatically adjusts width on mobile.

## 🐛 Troubleshooting

### Map not showing?
- Check that Leaflet CSS is imported in `main.jsx`
- Verify `height` prop is set
- Check browser console for errors

### Markers not appearing?
- Verify marker data has `lat` and `lng` properties
- Check that coordinates are valid numbers
- Ensure markers are within map bounds

### Routing not working?
- Both pickup and dropoff must be selected
- Check network tab for OSRM API response
- Verify coordinates are in correct format [lat, lng]

### Heatmap not visible?
- Ensure `showHeatmap={true}`
- Verify heatmap points have `intensity` values (0-1)
- Check that points are within map view

## 💡 Tips

1. **Performance**: Use `React.lazy` for code splitting (already implemented)
2. **Caching**: Consider caching geocoding results
3. **Rate Limiting**: Debouncing is already implemented (600ms)
4. **Production**: Consider self-hosting OSRM for better performance
5. **Customization**: All components accept custom styling via Material UI `sx` prop

## 📚 Additional Resources

- [Full Documentation](./MAP_INTEGRATION_README.md)
- [Leaflet Documentation](https://leafletjs.com/)
- [React Leaflet Documentation](https://react-leaflet.js.org/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [OSRM Documentation](http://project-osrm.org/)

## ✅ Checklist

- [x] Packages installed
- [x] Leaflet CSS imported
- [x] Components created
- [x] TypeScript types defined
- [x] Demo page available
- [x] Documentation complete

## 🎉 You're Ready!

Start using the map in your app:

```tsx
import RideMap from './components/map/RideMap';

function MyApp() {
  return <RideMap />;
}
```

That's it! No API keys, no configuration, just import and use! 🚀
