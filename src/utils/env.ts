// src/utils/env.ts
export function getEnvVariable(key: string, defaultValue = ""): string {
  // Check for process.env (Node.js/Jest)
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key] as string;
  }

  // Check for import.meta.env (Vite)
  if (
    typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env[key]
  ) {
    return import.meta.env[key] as string;
  }

  return defaultValue;
}

// Usage:
// import { getEnvVariable } from '@/utils/env';
// const apiUrl = getEnvVariable('VITE_API_URL', 'http://localhost:5000/api');
