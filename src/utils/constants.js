// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  VEHICLES: {
    BASE: '/vehicles',
    STATS: '/vehicles/stats',
    LOCATIONS: '/vehicles/locations',
  },
  DRIVERS: {
    BASE: '/drivers',
    AVAILABLE: '/drivers/available',
  },
  TRIPS: {
    BASE: '/trips',
    ACTIVE: '/trips/active',
    HISTORY: '/trips/history',
  },
};

// Vehicle Statuses
export const VEHICLE_STATUS = {
  AVAILABLE: 'available',
  ON_TRIP: 'on_trip',
  MAINTENANCE: 'maintenance',
  OFFLINE: 'offline',
  IDLE: 'idle',
};

// Vehicle Types
export const VEHICLE_TYPES = {
  CAR: 'car',
  TRUCK: 'truck',
  VAN: 'van',
  SCOOTER: 'scooter',  
};

// Trip Statuses
export const TRIP_STATUS = {
  REQUESTED: 'requested',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Map Defaults
export const MAP_DEFAULTS = {
  CENTER: {
    lat: 37.7749, // Default to San Francisco
    lng: -122.4194,
  },
  ZOOM: 12,
  MIN_ZOOM: 10,
  MAX_ZOOM: 18,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  MAP_SETTINGS: 'mapSettings',
  THEME_PREFERENCE: 'themePreference',
};

// App Constants
export const APP_CONSTANTS = {
  APP_NAME: 'Transportation Ops',
  APP_VERSION: '1.0.0',
  DEFAULT_PAGE_SIZE: 10,
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
};

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_MAP_CLUSTERING: true,
};
