// @ts-nocheck
/**
 * PWA utilities for service worker registration and updates
 */

import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Hook to register service worker and handle updates
 */
export const usePWA = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      console.log('Service Worker registered:', registration);
      
      // Check for updates every hour
      if (registration) {
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // 1 hour
      }
    },
    onRegisterError(error) {
      console.error('Service Worker registration error:', error);
    },
    immediate: true,
  });

  const closePrompt = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  const updateApp = () => {
    updateServiceWorker(true);
  };

  return {
    needRefresh,
    offlineReady,
    updateApp,
    closePrompt,
  };
};

/**
 * Check if app is running in standalone mode (installed as PWA)
 */
export const isStandalone = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
};

/**
 * Check if device is iOS
 */
export const isIOS = () => {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
};

/**
 * Check if browser supports PWA installation
 */
export const canInstall = () => {
  return 'BeforeInstallPromptEvent' in window || isIOS();
};

/**
 * Get install instructions based on browser/device
 */
export const getInstallInstructions = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (isIOS()) {
    return {
      browser: 'Safari',
      steps: [
        'Tap the Share button',
        'Scroll down and tap "Add to Home Screen"',
        'Tap "Add" to confirm',
      ],
    };
  }
  
  if (userAgent.includes('chrome')) {
    return {
      browser: 'Chrome',
      steps: [
        'Tap the menu icon (⋮)',
        'Tap "Install app" or "Add to Home screen"',
        'Tap "Install" to confirm',
      ],
    };
  }
  
  if (userAgent.includes('firefox')) {
    return {
      browser: 'Firefox',
      steps: [
        'Tap the menu icon (⋮)',
        'Tap "Install"',
        'Tap "Add" to confirm',
      ],
    };
  }
  
  if (userAgent.includes('edge')) {
    return {
      browser: 'Edge',
      steps: [
        'Tap the menu icon (⋯)',
        'Tap "Apps"',
        'Tap "Install this site as an app"',
      ],
    };
  }
  
  return {
    browser: 'Browser',
    steps: [
      'Look for an install option in your browser menu',
      'Follow the prompts to install',
    ],
  };
};

/**
 * Cache management utilities
 */
export const cacheManager = {
  /**
   * Clear all caches
   */
  async clearAll() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      console.log('All caches cleared');
    }
  },

  /**
   * Get cache size
   */
  async getSize() {
    if ('caches' in window && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage,
        quota: estimate.quota,
        percentage: ((estimate.usage / estimate.quota) * 100).toFixed(2),
      };
    }
    return null;
  },

  /**
   * Precache specific URLs
   */
  async precache(urls) {
    if ('caches' in window) {
      const cache = await caches.open('precache-v1');
      await cache.addAll(urls);
      console.log('URLs precached:', urls);
    }
  },
};

/**
 * Offline detection utilities
 */
export const offlineManager = {
  /**
   * Check if online
   */
  isOnline() {
    return navigator.onLine;
  },

  /**
   * Listen for online/offline events
   */
  listen(onOnline, onOffline) {
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  },

  /**
   * Save data for offline use
   */
  saveForOffline(key, data) {
    try {
      localStorage.setItem(`offline-${key}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving offline data:', error);
    }
  },

  /**
   * Get offline data
   */
  getOfflineData(key) {
    try {
      const data = localStorage.getItem(`offline-${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting offline data:', error);
      return null;
    }
  },

  /**
   * Clear offline data
   */
  clearOfflineData(key) {
    try {
      if (key) {
        localStorage.removeItem(`offline-${key}`);
      } else {
        // Clear all offline data
        Object.keys(localStorage)
          .filter((k) => k.startsWith('offline-'))
          .forEach((k) => localStorage.removeItem(k));
      }
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  },
};

export default {
  usePWA,
  isStandalone,
  isIOS,
  canInstall,
  getInstallInstructions,
  cacheManager,
  offlineManager,
};
