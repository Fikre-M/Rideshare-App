import { create } from 'zustand';

/**
 * API Key Store - Manages API keys securely in sessionStorage
 */

const SESSION_STORAGE_KEY = 'app_api_keys';

interface ApiKeys {
  googleAI: string;
  googleAIModel: string;
  openAI: string;
  mapbox: string;
}

type ValidationStatus = null | 'validating' | 'valid' | 'invalid';

interface ValidationStatuses {
  googleAI: ValidationStatus;
  openAI: ValidationStatus;
  mapbox: ValidationStatus;
}

interface ValidationErrors {
  googleAI: string | null;
  openAI: string | null;
  mapbox: string | null;
}

interface ApiKeyState {
  keys: ApiKeys;
  validationStatus: ValidationStatuses;
  validationErrors: ValidationErrors;
  setupComplete: boolean;
  showSetupModal: boolean;
  initialize: () => boolean;
  setKey: (keyType: keyof ApiKeys, value: string) => void;
  setKeys: (newKeys: Partial<ApiKeys>) => void;
  clearKey: (keyType: keyof ApiKeys) => void;
  clearAllKeys: () => void;
  setValidationStatus: (keyType: keyof ValidationStatuses, status: ValidationStatus, error?: string | null) => void;
  completeSetup: () => void;
  setShowSetupModal: (show: boolean) => void;
  hasKey: (keyType: keyof ApiKeys) => boolean;
  hasAnyKeys: () => boolean;
  getKey: (keyType: keyof ApiKeys) => string;
}

const getRuntimeConfig = (): Record<string, string> => {
  return (window as any).APP_CONFIG || {};
};

const loadKeysFromSession = (): Partial<ApiKeys> => {
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to load API keys from session:', error);
    return {};
  }
};

const saveKeysToSession = (keys: ApiKeys): void => {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(keys));
  } catch (error) {
    console.error('Failed to save API keys to session:', error);
  }
};

const getInitialKeys = (): ApiKeys => {
  const sessionKeys = loadKeysFromSession();
  const runtimeConfig = getRuntimeConfig();
  
  return {
    googleAI: sessionKeys.googleAI || runtimeConfig.googleAIApiKey || import.meta.env.VITE_GOOGLE_AI_API_KEY || '',
    googleAIModel: sessionKeys.googleAIModel || runtimeConfig.googleAIModel || import.meta.env.VITE_GOOGLE_AI_MODEL || 'gemini-2.5-flash',
    openAI: sessionKeys.openAI || runtimeConfig.openAIApiKey || import.meta.env.VITE_OPENAI_API_KEY || '',
    mapbox: sessionKeys.mapbox || runtimeConfig.mapboxToken || import.meta.env.VITE_MAPBOX_TOKEN || '',
  };
};

export const useApiKeyStore = create<ApiKeyState>()((set, get) => ({
  keys: getInitialKeys(),
  validationStatus: { googleAI: null, openAI: null, mapbox: null },
  validationErrors: { googleAI: null, openAI: null, mapbox: null },
  setupComplete: false,
  showSetupModal: false,
  
  initialize: () => {
    const keys = get().keys;
    const hasRequiredKeys = !!(keys.googleAI || keys.openAI || keys.mapbox);
    set({ setupComplete: hasRequiredKeys, showSetupModal: !hasRequiredKeys });
    return hasRequiredKeys;
  },
  
  setKey: (keyType, value) => {
    const newKeys = { ...get().keys, [keyType]: value };
    set({ keys: newKeys });
    saveKeysToSession(newKeys);
  },
  
  setKeys: (newKeys) => {
    const updatedKeys = { ...get().keys, ...newKeys };
    set({ keys: updatedKeys });
    saveKeysToSession(updatedKeys);
  },
  
  clearKey: (keyType) => {
    const newKeys = { ...get().keys, [keyType]: '' };
    set({
      keys: newKeys,
      validationStatus: { ...get().validationStatus, [keyType]: null },
      validationErrors: { ...get().validationErrors, [keyType]: null },
    });
    saveKeysToSession(newKeys);
  },
  
  clearAllKeys: () => {
    const emptyKeys: ApiKeys = {
      googleAI: '',
      googleAIModel: 'gemini-2.5-flash',
      openAI: '',
      mapbox: '',
    };
    set({
      keys: emptyKeys,
      validationStatus: { googleAI: null, openAI: null, mapbox: null },
      validationErrors: { googleAI: null, openAI: null, mapbox: null },
      setupComplete: false,
    });
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  },
  
  setValidationStatus: (keyType, status, error = null) => {
    set({
      validationStatus: { ...get().validationStatus, [keyType]: status },
      validationErrors: { ...get().validationErrors, [keyType]: error ?? null },
    });
  },
  
  completeSetup: () => set({ setupComplete: true, showSetupModal: false }),
  
  setShowSetupModal: (show) => set({ showSetupModal: show }),
  
  hasKey: (keyType) => {
    const keys = get().keys;
    return !!keys[keyType] &&
      keys[keyType] !== 'your_google_ai_api_key_here' &&
      keys[keyType] !== 'your_openai_api_key_here' &&
      keys[keyType] !== 'your_mapbox_access_token_here';
  },
  
  hasAnyKeys: () => {
    const { hasKey } = get();
    return hasKey('googleAI') || hasKey('openAI') || hasKey('mapbox');
  },
  
  getKey: (keyType) => get().keys[keyType] || '',
}));

if (typeof window !== 'undefined') {
  useApiKeyStore.getState().initialize();
}
