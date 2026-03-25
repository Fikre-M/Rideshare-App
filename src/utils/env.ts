// @ts-nocheck
// src/utils/env.js
export function getEnvVariable(key, defaultValue = "") {
  // Check for process.env (Node.js/Jest)
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }

  // Check for import.meta.env (Vite)
  if (
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env[key]
  ) {
    return import.meta.env[key];
  }

  return defaultValue;
}

// Usage:
// import { getEnvVariable } from '@/utils/env';
// const apiUrl = getEnvVariable('VITE_API_URL', 'http://localhost:5000/api');
