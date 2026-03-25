// @ts-nocheck
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useNotificationStore = create(
  persist(
    (set, get) => ({
      // State
      permission: 'default', // 'default' | 'granted' | 'denied'
      enabled: false,
      hasRequestedPermission: false,
      notificationHistory: [],

      // Actions
      setPermission: (permission) => set({ permission }),
      
      setEnabled: (enabled) => set({ enabled }),
      
      setHasRequestedPermission: (hasRequested) => 
        set({ hasRequestedPermission: hasRequested }),

      // Request notification permission
      requestPermission: async () => {
        if (!('Notification' in window)) {
          console.warn('This browser does not support notifications');
          return false;
        }

        if (get().hasRequestedPermission) {
          return get().permission === 'granted';
        }

        try {
          const permission = await Notification.requestPermission();
          set({ 
            permission, 
            enabled: permission === 'granted',
            hasRequestedPermission: true 
          });
          return permission === 'granted';
        } catch (error) {
          console.error('Error requesting notification permission:', error);
          return false;
        }
      },

      // Show a notification
      showNotification: async (title, options = {}) => {
        const state = get();
        
        if (!state.enabled || state.permission !== 'granted') {
          console.warn('Notifications are not enabled or permission not granted');
          return null;
        }

        try {
          // If service worker is available, use it
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            const registration = await navigator.serviceWorker.ready;
            const notification = await registration.showNotification(title, {
              icon: '/icons/icon-192x192.png',
              badge: '/icons/icon-192x192.png',
              vibrate: [200, 100, 200],
              ...options,
            });

            // Add to history
            set((state) => ({
              notificationHistory: [
                {
                  id: Date.now(),
                  title,
                  body: options.body,
                  timestamp: new Date().toISOString(),
                },
                ...state.notificationHistory.slice(0, 49), // Keep last 50
              ],
            }));

            return notification;
          } else {
            // Fallback to regular notification
            const notification = new Notification(title, {
              icon: '/icons/icon-192x192.png',
              ...options,
            });

            // Add to history
            set((state) => ({
              notificationHistory: [
                {
                  id: Date.now(),
                  title,
                  body: options.body,
                  timestamp: new Date().toISOString(),
                },
                ...state.notificationHistory.slice(0, 49),
              ],
            }));

            return notification;
          }
        } catch (error) {
          console.error('Error showing notification:', error);
          return null;
        }
      },

      // Clear notification history
      clearHistory: () => set({ notificationHistory: [] }),

      // Initialize - check current permission
      initialize: () => {
        if ('Notification' in window) {
          set({ permission: Notification.permission });
        }
      },
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        enabled: state.enabled,
        hasRequestedPermission: state.hasRequestedPermission,
        notificationHistory: state.notificationHistory,
      }),
    }
  )
);

// Initialize on load
if (typeof window !== 'undefined') {
  useNotificationStore.getState().initialize();
}
