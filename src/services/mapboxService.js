// Mapbox Service - Real route fetching and directions
import { useApiKeyStore } from '../stores/apiKeyStore';

class MapboxService {
  constructor() {
    this.baseUrl = 'https://api.mapbox.com';
  }

  // Get Mapbox access token
  getAccessToken() {
    const token = useApiKeyStore.getState().getKey('mapbox');
    
    if (!token || token === 'your_mapbox_access_token_here') {
      throw new Error('Mapbox access token not configured. Please add your token in settings.');
    }

    return token;
  }

  // Fetch directions between coordinates
  async getDirections(coordinates, options = {}) {
    try {
      const token = this.getAccessToken();
      
      // Format coordinates as "lng,lat;lng,lat;..."
      const coordString = coordinates
        .map(coord => `${coord.lng || coord[0]},${coord.lat || coord[1]}`)
        .join(';');

      // Build query parameters
      const params = new URLSearchParams({
        access_token: token,
        geometries: 'geojson',
        overview: 'full',
        steps: options.steps !== false,
        alternatives: options.alternatives !== false ? 'true' : 'false',
        annotations: 'duration,distance,speed',
        ...options.params,
      });

      // Choose profile (driving-traffic, driving, walking, cycling)
      const profile = options.profile || 'driving-traffic';
      
      const url = `${this.baseUrl}/directions/v5/mapbox/${profile}/${coordString}?${params}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Mapbox API request failed');
      }

      const data = await response.json();

      // Transform routes to a more usable format
      const routes = data.routes.map((route, index) => ({
        id: `route_${index}`,
        duration: route.duration, // seconds
        distance: route.distance, // meters
        durationMinutes: Math.round(route.duration / 60),
        distanceKm: (route.distance / 1000).toFixed(2),
        distanceMiles: (route.distance / 1609.34).toFixed(2),
        geometry: route.geometry,
        legs: route.legs.map(leg => ({
          duration: leg.duration,
          distance: leg.distance,
          steps: leg.steps?.map(step => ({
            instruction: step.maneuver?.instruction,
            distance: step.distance,
            duration: step.duration,
            name: step.name,
          })),
        })),
        weight: route.weight,
        weightName: route.weight_name,
      }));

      return {
        routes,
        waypoints: data.waypoints,
        code: data.code,
      };
    } catch (error) {
      console.error('Mapbox directions error:', error);
      throw new Error(`Failed to fetch directions: ${error.message}`);
    }
  }

  // Get route with traffic information
  async getRouteWithTraffic(origin, destination, options = {}) {
    return this.getDirections([origin, destination], {
      profile: 'driving-traffic',
      alternatives: true,
      ...options,
    });
  }

  // Geocode an address to coordinates
  async geocodeAddress(address) {
    try {
      const token = this.getAccessToken();
      
      const params = new URLSearchParams({
        access_token: token,
        limit: 5,
      });

      const url = `${this.baseUrl}/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?${params}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const data = await response.json();

      return data.features.map(feature => ({
        name: feature.place_name,
        coordinates: {
          lng: feature.center[0],
          lat: feature.center[1],
        },
        bbox: feature.bbox,
        context: feature.context,
      }));
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error(`Failed to geocode address: ${error.message}`);
    }
  }

  // Reverse geocode coordinates to address
  async reverseGeocode(coordinates) {
    try {
      const token = this.getAccessToken();
      
      const lng = coordinates.lng || coordinates[0];
      const lat = coordinates.lat || coordinates[1];

      const params = new URLSearchParams({
        access_token: token,
      });

      const url = `${this.baseUrl}/geocoding/v5/mapbox.places/${lng},${lat}.json?${params}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Reverse geocoding request failed');
      }

      const data = await response.json();

      if (data.features.length === 0) {
        return null;
      }

      return {
        name: data.features[0].place_name,
        coordinates: {
          lng: data.features[0].center[0],
          lat: data.features[0].center[1],
        },
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw new Error(`Failed to reverse geocode: ${error.message}`);
    }
  }

  // Get isochrone (reachable area within time/distance)
  async getIsochrone(coordinates, options = {}) {
    try {
      const token = this.getAccessToken();
      
      const lng = coordinates.lng || coordinates[0];
      const lat = coordinates.lat || coordinates[1];

      const params = new URLSearchParams({
        access_token: token,
        contours_minutes: options.minutes || '5,10,15',
        polygons: 'true',
        ...options.params,
      });

      const profile = options.profile || 'driving';
      const url = `${this.baseUrl}/isochrone/v1/mapbox/${profile}/${lng},${lat}?${params}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Isochrone request failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Isochrone error:', error);
      throw new Error(`Failed to get isochrone: ${error.message}`);
    }
  }

  // Calculate distance matrix between multiple points
  async getMatrix(coordinates, options = {}) {
    try {
      const token = this.getAccessToken();
      
      const coordString = coordinates
        .map(coord => `${coord.lng || coord[0]},${coord.lat || coord[1]}`)
        .join(';');

      const params = new URLSearchParams({
        access_token: token,
        sources: options.sources || 'all',
        destinations: options.destinations || 'all',
        annotations: options.annotations || 'duration,distance',
      });

      const profile = options.profile || 'driving';
      const url = `${this.baseUrl}/directions-matrix/v1/mapbox/${profile}/${coordString}?${params}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Matrix request failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Matrix error:', error);
      throw new Error(`Failed to get distance matrix: ${error.message}`);
    }
  }
}

export default new MapboxService();
