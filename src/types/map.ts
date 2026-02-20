// Map-related TypeScript interfaces

export interface DriverMarker {
  id: string;
  name: string;
  rating: number;
  lat: number;
  lng: number;
  vehicleType: string;
  available: boolean;
  eta?: number; // Estimated arrival time in minutes
}

export interface PassengerLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface RouteOption {
  coordinates: [number, number][];
  distance: number; // in meters
  duration: number; // in seconds
  isAIRecommended?: boolean;
  geometry?: any; // GeoJSON geometry
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number; // 0-1 scale
}

export interface LocationSearchResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  importance?: number;
}

export interface OSRMRoute {
  distance: number;
  duration: number;
  geometry: {
    coordinates: [number, number][];
    type: string;
  };
}

export interface OSRMResponse {
  code: string;
  routes: OSRMRoute[];
  waypoints: any[];
}
