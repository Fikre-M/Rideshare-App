import { create } from 'zustand';

/**
 * API Key Store - Manages API keys securely in sessionStorage
 * Keys are stored in sessionStorage (not localStorage) so they don't persist across sessions
 * This provides better security while still allowing users to configure keys without rebuilding
 */

const SESSION_STORAGE_KEY = 'app_api_keys';

// Helper to get runtime config
const getRuntimeConfig = () => {
  return window.APP_CONFIG || {};
};

// Helper to load keys from sessionStorage
const loadKeysFromSession = () => {
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to load API keys from session:', error);
    return {};
  }
};

// Helper to save keys to sessionStorage
const saveKeysToSession = (keys) => {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(keys));
  } catch (error) {
    console.error('Failed to save API keys to session:', error);
  }
};

// Helper to get keys from multiple sources (priority: session > runtime config > env)
const getInitialKeys = () => {
  const sessionKeys = loadKeysFromSession();
  const runtimeConfig = getRuntimeConfig();
  
  return {
    googleAI: sessionKeys.googleAI || runtimeConfig.googleAIApiKey || import.meta.env.VITE_GOOGLE_AI_API_KEY || '',
    googleAIModel: sessionKeys.googleAIModel || runtimeConfig.googleAIModel || import.meta.env.VITE_GOOGLE_AI_MODEL || 'gemini-2.5-flash',
    openAI: sessionKeys.openAI || runtimeConfig.openAIApiKey || import.meta.env.VITE_OPENAI_API_KEY || '',
    mapbox: sessionKeys.mapbox || runtimeConfig.mapboxToken || import.meta.env.VITE_MAPBOX_TOKEN || '',
  };
};

export const useApiKeyStore = create((set, get) => ({
  // State
  keys: getInitialKeys(),
  validationStatus: {
    googleAI: null, // null | 'validating' | 'valid' | 'invalid'
    openAI: null,
    mapbox: null,
  },
  validationErrors: {
    googleAI: null,
    openAI: null,
    mapbox: null,
  },
  setupComplete: false,
  showSetupModal: false,
  
  // Initialize - check if setup is needed
  initialize: () => {
    const keys = get().keys;
    const hasRequiredKeys = keys.googleAI || keys.openAI || keys.mapbox;
    
    set({
      setupComplete: hasRequiredKeys,
      showSetupModal: !hasRequiredKeys,
    });
    
    return hasRequiredKeys;
  },
  
  // Set a single API key
  setKey: (keyType, value) => {
    const currentKeys = get().keys;
    const newKeys = { ...currentKeys, [keyType]: value };
    
    set({ keys: newKeys });
    saveKeysToSession(newKeys);
  },
  
  // Set multiple keys at once
  setKeys: (newKeys) => {
    const currentKeys = get().keys;
    const updatedKeys = { ...currentKeys, ...newKeys };
    
    set({ keys: updatedKeys });
    saveKeysToSession(updatedKeys);
  },
  
  // Clear a specific key
  clearKey: (keyType) => {
    const currentKeys = get().keys;
    const newKeys = { ...currentKeys, [keyType]: '' };
    
    set({ 
      keys: newKeys,
      validationStatus: { ...get().validationStatus, [keyType]: null },
      validationErrors: { ...get().validationErrors, [keyType]: null },
    });
    saveKeysToSession(newKeys);
  },
  
  // Clear all keys
  clearAllKeys: () => {
    const emptyKeys = {
      googleAI: '',
      googleAIModel: 'gemini-2.5-flash',
      openAI: '',
      mapbox: '',
    };
    
    set({ 
      keys: emptyKeys,
      validationStatus: {
        googleAI: null,
        openAI: null,
        mapbox: null,
      },
      validationErrors: {
        googleAI: null,
        openAI: null,
        mapbox: null,
      },
      setupComplete: false,
    });
    
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  },
  
  // Set validation status
  setValidationStatus: (keyType, status, error = null) => {
    set({
      validationStatus: { ...get().validationStatus, [keyType]: status },
      validationErrors: { ...get().validationErrors, [keyType]: error },
    });
  },
  
  // Mark setup as complete
  completeSetup: () => {
    set({ setupComplete: true, showSetupModal: false });
  },
  
  // Show/hide setup modal
  setShowSetupModal: (show) => {
    set({ showSetupModal: show });
  },
  
  // Check if a specific key is configured
  hasKey: (keyType) => {
    const keys = get().keys;
    return !!keys[keyType] && keys[keyType] !== 'your_google_ai_api_key_here' && keys[keyType] !== 'your_openai_api_key_here' && keys[keyType] !== 'your_mapbox_access_token_here';
  },
  
  // Check if any keys are configured
  hasAnyKeys: () => {
    const { hasKey } = get();
    return hasKey('googleAI') || hasKey('openAI') || hasKey('mapbox');
  },
  
  // Get a specific key
  getKey: (keyType) => {
    return get().keys[keyType] || '';
  },
}));

// Initialize on load
if (typeof window !== 'undefined') {
  useApiKeyStore.getState().initialize();
}
