# Free Map Integration with Leaflet.js & OpenStreetMap

## Overview

Complete map integration using **100% free** services - no API keys required!

### Services Used (All Free)

- **Tiles**: OpenStreetMap (light mode) & CartoDB (dark mode)
- **Geocoding**: Nominatim by OpenStreetMap
- **Routing**: OSRM (Open Source Routing Machine)
- **Heatmap**: leaflet.heat plugin
- **Library**: Leaflet.js via react-leaflet

## Features Implemented

### 1. MapView.tsx - Core Map Component
✅ Renders Leaflet map with OpenStreetMap tiles
✅ Custom SVG icons for drivers (car) and passengers (pin)
✅ Smooth marker animations with CSS transitions
✅ Auto-fits bounds to show all markers
✅ Dark mode support (CartoDB dark tiles)
✅ Fixed Vite marker icon bug
✅ Responsive height (full screen mobile, 60vh desktop)

### 2. LocationSearch.tsx - Geocoding
✅ Nominatim API integration (free OSM geocoding)
✅ 600ms debounce to respect usage policy
✅ Autocomplete dropdown with up to 5 results
✅ Required User-Agent header
✅ Error handling and empty results messages
✅ Material UI styled inputs

### 3. RouteDisplay.tsx - Turn-by-Turn Routing
✅ OSRM public API integration (free, no key)
✅ Up to 3 alternative routes displayed
✅ Different colors for routes (primary vs alternatives)
✅ Clickable routes to switch active route
✅ Route info panel with distance and duration
✅ AI Recommended badge support
✅ Animated dashed line on AI-recommended route

### 4. DemandHeatmap.tsx - Demand Visualization
✅ leaflet.heat plugin integration
✅ Real-time heatmap updates
✅ Toggle button to show/hide layer
✅ Color gradient: blue (low) → yellow (medium) → red (high)
✅ Accepts intensity-based heatmap points

### 5. SimulatedDrivers.tsx - Live Driver Simulation
✅ 8-12 simulated driver markers
✅ Movement every 3 seconds (GPS simulation)
✅ Clickable markers with driver info popups
✅ Drivers within 2km pulse with green ring
✅ Rating, vehicle type, ETA display

### 6. UserLocation.tsx - Geolocation
✅ Browser geolocation with permission prompt
✅ "You are here" marker with pulsing blue dot
✅ Fallback to NYC if denied (with toast notification)
✅ "Locate Me" button to re-center map
✅ Accuracy circle visualization

### 7. RideMap.tsx - Main Composite Component
✅ Composes all map components
✅ React.lazy and Suspense for code splitting
✅ SSR safety with window check
✅ Responsive height configuration
✅ Single import for entire map system

## Installation

Packages installed:
```bash
npm install leaflet react-leaflet leaflet-routing-machine leaflet.heat @types/leaflet
```

## Usage

### Basic Usage

```tsx
import RideMap from './components/map/RideMap';

function App() {
  return (
    <RideMap
      showLocationSearch={true}
      showRouting={true}
      showHeatmap={false}
      showSimulatedDrivers={true}
      showUserLocation={true}
    />
  );
}
```

### With Callbacks

```tsx
import RideMap from './components/map/RideMap';
import { RouteOption } from './types/map';

function App() {
  const handleRouteSelect = (route: RouteOption) => {
    console.log('Selected route:', route);
    console.log('Distance:', route.distance, 'meters');
    console.log('Duration:', route.duration, 'seconds');
  };

  const handleLocationSelect = (
    type: 'pickup' | 'dropoff',
    lat: number,
    lng: number,
    address: string
  ) => {
    console.log(`${type}:`, { lat, lng, address });
  };

  return (
    <RideMap
      onRouteSelect={handleRouteSelect}
      onLocationSelect={handleLocationSelect}
    />
  );
}
```

### With Custom Data

```tsx
import RideMap from './components/map/RideMap';
import { DriverMarker, HeatmapPoint } from './types/map';

function App() {
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

  const heatmapPoints: HeatmapPoint[] = [
    { lat: 40.7128, lng: -74.0060, intensity: 0.8 },
    { lat: 40.7580, lng: -73.9855, intensity: 0.6 },
  ];

  return (
    <RideMap
      driverMarkers={drivers}
      heatmapPoints={heatmapPoints}
      showHeatmap={true}
    />
  );
}
```

## API Endpoints Used

### OpenStreetMap Tiles
```
Light mode: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
Dark mode: https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
```

### Nominatim Geocoding
```
https://nominatim.openstreetmap.org/search?q={query}&format=json&limit=5
Headers: { 'User-Agent': 'RideshareApp/1.0' }
```

### OSRM Routing
```
https://router.project-osrm.org/route/v1/driving/{lng1},{lat1};{lng2},{lat2}?overview=full&geometries=geojson&alternatives=true
```

## TypeScript Types

All types defined in `src/types/map.ts`:

```typescript
interface DriverMarker {
  id: string;
  name: string;
  rating: number;
  lat: number;
  lng: number;
  vehicleType: string;
  available: boolean;
  eta?: number;
}

interface PassengerLocation {
  lat: number;
  lng: number;
  address?: string;
}

interface RouteOption {
  coordinates: [number, number][];
  distance: number; // meters
  duration: number; // seconds
  isAIRecommended?: boolean;
}

interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number; // 0-1
}
```

## Component Props

### RideMap Props

```typescript
interface RideMapProps {
  showLocationSearch?: boolean;      // Default: true
  showRouting?: boolean;             // Default: false
  showHeatmap?: boolean;             // Default: false
  showSimulatedDrivers?: boolean;    // Default: true
  showUserLocation?: boolean;        // Default: true
  driverMarkers?: DriverMarker[];    // Default: []
  heatmapPoints?: HeatmapPoint[];    // Default: []
  height?: string;                   // Default: '60vh'
  onRouteSelect?: (route: RouteOption) => void;
  onLocationSelect?: (type: 'pickup' | 'dropoff', lat: number, lng: number, address: string) => void;
}
```

## Features

### Dark Mode Support
Automatically switches to CartoDB dark tiles when Material UI theme is in dark mode.

### Responsive Design
- Mobile: Full screen height (100vh)
- Desktop: Configurable height (default 60vh)
- Search panel adapts to screen size

### Performance Optimizations
- Lazy loading with React.lazy and Suspense
- Code splitting for map components
- Debounced geocoding requests (600ms)
- Efficient marker updates

### Animations
- Pulsing blue dot for user location
- Bouncing passenger marker
- Pulsing green rings for nearby drivers
- Animated dashed lines on AI-recommended routes
- Smooth marker transitions

## Demo Page

Visit `/map-demo` to see all features in action:
- Toggle features on/off
- Test location search
- View route alternatives
- See demand heatmap
- Watch simulated drivers move

## Usage Policy

### Nominatim (Geocoding)
- Must include User-Agent header
- Limit: 1 request per second
- Debounce implemented (600ms)
- Free for reasonable use

### OSRM (Routing)
- Public server provided by OSRM project
- Free for reasonable use
- No rate limits specified
- Consider self-hosting for production

### OpenStreetMap Tiles
- Free for all use
- Attribution required (automatically included)
- Consider tile caching for production

## Troubleshooting

### Marker Icons Not Showing
Fixed with icon import workaround in MapView.tsx:
```typescript
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
});
```

### Heatmap Not Showing
Ensure leaflet.heat is imported and points have intensity values:
```typescript
import 'leaflet.heat';

const points: HeatmapPoint[] = [
  { lat: 40.7128, lng: -74.0060, intensity: 0.8 }
];
```

### Geolocation Not Working
- Check browser permissions
- Use HTTPS (required for geolocation)
- Fallback to default location implemented

### Routes Not Displaying
- Verify coordinates are [lat, lng] format
- Check OSRM API response in network tab
- Ensure both pickup and dropoff are set

## File Structure

```
src/
├── components/map/
│   ├── MapView.tsx              # Core map component
│   ├── LocationSearch.tsx       # Geocoding search
│   ├── RouteDisplay.tsx         # Routing display
│   ├── DemandHeatmap.tsx        # Heatmap layer
│   ├── SimulatedDrivers.tsx     # Driver simulation
│   ├── UserLocation.tsx         # Geolocation
│   └── RideMap.tsx              # Main composite
├── types/
│   └── map.ts                   # TypeScript types
└── pages/
    └── MapDemo.tsx              # Demo page
```

## Integration with AI Features

The map can be integrated with AI features:

```tsx
import { useRouteOptimization } from './hooks/useAIFeatures';
import RideMap from './components/map/RideMap';

function SmartRideMap() {
  const { optimizeRoute } = useRouteOptimization();

  const handleRouteSelect = async (route: RouteOption) => {
    // Pass route to AI for optimization
    const aiResult = await optimizeRoute(
      [route.coordinates[0][0], route.coordinates[0][1]],
      [route.coordinates[route.coordinates.length - 1][0], 
       route.coordinates[route.coordinates.length - 1][1]],
      { prioritize: 'time' }
    );
    
    console.log('AI recommendation:', aiResult);
  };

  return <RideMap onRouteSelect={handleRouteSelect} />;
}
```

## Production Considerations

### For Production Use:

1. **Tile Server**: Consider self-hosting tiles or using a CDN
2. **Geocoding**: Self-host Nominatim or use commercial service
3. **Routing**: Self-host OSRM server for better performance
4. **Rate Limiting**: Implement request throttling
5. **Caching**: Cache geocoding and routing results
6. **Error Handling**: Add retry logic and fallbacks

### Self-Hosting OSRM:
```bash
docker run -t -i -p 5000:5000 -v "${PWD}:/data" osrm/osrm-backend osrm-routed --algorithm mld /data/map.osrm
```

## License

- Leaflet: BSD 2-Clause License
- OpenStreetMap: ODbL
- OSRM: BSD 2-Clause License
- leaflet.heat: MIT License

## Support

For issues:
1. Check browser console for errors
2. Verify network requests in DevTools
3. Test with demo page first
4. Check Leaflet documentation: https://leafletjs.com/

## Summary

✅ 100% free map solution
✅ No API keys required
✅ Full TypeScript support
✅ Dark mode compatible
✅ Mobile responsive
✅ Production-ready components
✅ Comprehensive demo page

All map functionality works out of the box with zero configuration!
