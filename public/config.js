// Runtime Configuration
// This file is loaded at runtime (not build time) and can be modified
// without rebuilding the application. Perfect for Docker/K8s deployments.
//
// To inject environment variables at runtime:
// 1. Replace placeholders in this file with actual values
// 2. Mount this file as a volume in Docker/K8s
// 3. Or use envsubst to replace values: envsubst < config.template.js > config.js

window.APP_CONFIG = {
  // API Configuration
  apiUrl: '${VITE_API_URL}' || 'http://localhost:3000/api',
  wsUrl: '${VITE_WS_URL}' || 'ws://localhost:3000',
  
  // API Keys (can be injected at runtime)
  // Leave empty to use in-app configuration
  googleAIApiKey: '${VITE_GOOGLE_AI_API_KEY}' || '',
  googleAIModel: '${VITE_GOOGLE_AI_MODEL}' || 'gemini-2.5-flash',
  openAIApiKey: '${VITE_OPENAI_API_KEY}' || '',
  mapboxToken: '${VITE_MAPBOX_TOKEN}' || '',
  
  // Feature Flags
  features: {
    aiAssistant: true,
    realTimeTracking: true,
    offlineMode: false,
  },
  
  // Map Configuration
  map: {
    style: 'mapbox://styles/mapbox/streets-v11',
    defaultCenter: {
      lat: 40.7128,
      lng: -74.0060,
    },
    defaultZoom: 12,
  },
};

// Clean up placeholder values
Object.keys(window.APP_CONFIG).forEach(key => {
  if (typeof window.APP_CONFIG[key] === 'string' && window.APP_CONFIG[key].startsWith('${')) {
    window.APP_CONFIG[key] = '';
  }
});
