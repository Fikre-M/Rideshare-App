/**
 * Application configuration using environment variables
 * Provides type-safe access to environment configuration
 */

const config = {
  // App Info
  app: {
    name: import.meta.env.VITE_APP_NAME || 'AI Rideshare Platform',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.MODE || 'development',
    isProduction: import.meta.env.PROD,
    isDevelopment: import.meta.env.DEV,
  },

  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8000',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10),
    cacheEnabled: import.meta.env.VITE_API_CACHE_ENABLED === 'true',
    cacheTTL: parseInt(import.meta.env.VITE_API_CACHE_TTL || '300000', 10),
  },

  // Authentication
  auth: {
    tokenKey: import.meta.env.VITE_AUTH_TOKEN_KEY || 'auth_token',
    refreshTokenKey: import.meta.env.VITE_REFRESH_TOKEN_KEY || 'refresh_token',
    tokenExpiryKey: import.meta.env.VITE_TOKEN_EXPIRY_KEY || 'token_expiry',
  },

  // AI & ML Services
  ai: {
    apiUrl: import.meta.env.VITE_AI_API_URL || 'http://localhost:8001/api/ai',
    openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    model: import.meta.env.VITE_AI_MODEL || 'gpt-4-turbo',
  },

  // Map Configuration
  map: {
    accessToken: import.meta.env.VITE_MAPBOX_TOKEN || '',
    style: import.meta.env.VITE_MAP_STYLE || 'mapbox://styles/mapbox/streets-v11',
    defaultCenter: {
      lat: parseFloat(import.meta.env.VITE_DEFAULT_LAT || '40.7128'),
      lng: parseFloat(import.meta.env.VITE_DEFAULT_LNG || '-74.0060'),
    },
    defaultZoom: parseInt(import.meta.env.VITE_DEFAULT_ZOOM || '12', 10),
  },

  // Payment Configuration
  payment: {
    stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || '',
    stripeSecretKey: import.meta.env.VITE_STRIPE_SECRET_KEY || '',
    currency: import.meta.env.VITE_CURRENCY || 'usd',
  },

  // Analytics & Monitoring
  analytics: {
    sentryDsn: import.meta.env.VITE_SENTRY_DSN || '',
    googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || '',
    logLevel: import.meta.env.VITE_LOGGER_LEVEL || 'debug',
  },

  // Feature Flags
  features: {
    aiAssistant: import.meta.env.VITE_FEATURE_AI_ASSISTANT === 'true',
    realTimeTracking: import.meta.env.VITE_FEATURE_REAL_TIME_TRACKING !== 'false',
    offlineMode: import.meta.env.VITE_FEATURE_OFFLINE_MODE === 'true',
  },

  // Security
  security: {
    cspEnabled: import.meta.env.VITE_CSP_ENABLED !== 'false',
    rateLimit: {
      requests: parseInt(import.meta.env.VITE_RATE_LIMIT_REQUESTS || '100', 10),
      window: parseInt(import.meta.env.VITE_RATE_LIMIT_WINDOW || '15', 10),
    },
  },
};

// Validate required configuration
const validateConfig = () => {
  const required = [
    { key: 'VITE_API_URL', value: config.api.baseUrl },
    { key: 'VITE_MAPBOX_TOKEN', value: config.map.accessToken },
  ];

  const missing = required.filter((item) => !item.value);

  if (missing.length > 0) {
    console.warn('Missing required environment variables:');
    missing.forEach((item) => console.warn(`- ${item.key}`));
    
    if (config.app.isProduction) {
      throw new Error('Missing required environment variables');
    }
  }
};

// Run validation
validateConfig();

export default config;
