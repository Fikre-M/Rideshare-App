/**
 * Theme Store with Dark/Light/Auto mode support
 * Uses Zustand for state management and persists to localStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeState {
  mode: ThemeMode;
  effectiveMode: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  updateEffectiveMode: () => void;
}

// Check system preference
const getSystemPreference = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'auto',
      effectiveMode: getSystemPreference(),

      setMode: (mode: ThemeMode) => {
        set({ mode });
        get().updateEffectiveMode();
      },

      updateEffectiveMode: () => {
        const { mode } = get();
        const effectiveMode = mode === 'auto' ? getSystemPreference() : mode;
        set({ effectiveMode });
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ mode: state.mode }),
    }
  )
);

// Listen for system theme changes
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  mediaQuery.addEventListener('change', () => {
    useThemeStore.getState().updateEffectiveMode();
  });
}
