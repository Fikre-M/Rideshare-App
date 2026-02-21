// Mock Mapbox GL for tests
export class Map {
  constructor(options: any) {
    this.options = options;
  }

  on = jest.fn();
  off = jest.fn();
  addSource = jest.fn();
  addLayer = jest.fn();
  removeLayer = jest.fn();
  removeSource = jest.fn();
  setLayoutProperty = jest.fn();
  setPaintProperty = jest.fn();
  flyTo = jest.fn();
  fitBounds = jest.fn();
  getBounds = jest.fn(() => ({
    getNorthEast: () => ({ lat: 40.7829, lng: -73.9441 }),
    getSouthWest: () => ({ lat: 40.7489, lng: -73.9441 })
  }));
  getZoom = jest.fn(() => 12);
  getCenter = jest.fn(() => ({ lat: 40.7589, lng: -73.9441 }));
  remove = jest.fn();
  resize = jest.fn();
  
  options: any;
}

export class Marker {
  constructor(options?: any) {
    this.options = options;
  }

  setLngLat = jest.fn().mockReturnThis();
  addTo = jest.fn().mockReturnThis();
  remove = jest.fn().mockReturnThis();
  setPopup = jest.fn().mockReturnThis();
  
  options: any;
}

export class Popup {
  constructor(options?: any) {
    this.options = options;
  }

  setLngLat = jest.fn().mockReturnThis();
  setHTML = jest.fn().mockReturnThis();
  addTo = jest.fn().mockReturnThis();
  remove = jest.fn().mockReturnThis();
  
  options: any;
}

export default {
  Map,
  Marker,
  Popup,
  accessToken: 'test-token'
};