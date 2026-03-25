import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type NotificationPermission = 'default' | 'granted' | 'denied';

interface NotificationHistoryItem {
  id: number;
  title: string;
  body: string | undefined;
  timestamp: string;
}

interface NotificationOptions {
  body?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{ action: string; title: string }>;
  data?: Record<string, unknown>;
  vibrate?: number[];
  icon?: string;
  badge?: string;
  [key: string]: unknown;
}

interface NotificationState {
  permission: NotificationPermission;
  enabled: boolean;
  hasRequestedPermission: boolean;
  notificationHistory: NotificationHistoryItem[];
  setPermission: (permission: NotificationPermission) => void;
  setEnabled: (enabled: boolean) => void;
  setHasRequestedPermission: (hasRequested: boolean) => void;
  requestPermission: () => Promise<boolean>;
  showNotification: (title: string, options?: NotificationOptions) => Promise<Notification | null>;
  clearHistory: () => void;
  initialize: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      permission: 'default',
      enabled: false,
      hasRequestedPermission: false,
      notificationHistory: [],

      setPermission: (permission) => set({ permission }),
      setEnabled: (enabled) => set({ enabled }),
      setHasRequestedPermission: (hasRequested) => set({ hasRequestedPermission: hasRequested }),

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
            permission: permission as NotificationPermission,
            enabled: permission === 'granted',
            hasRequestedPermission: true
          });
          return permission === 'granted';
        } catch (error) {
          console.error('Error requesting notification permission:', error);
          return false;
        }
      },

      showNotification: async (title, options = {}) => {
        const state = get();
        if (!state.enabled || state.permission !== 'granted') {
          console.warn('Notifications are not enabled or permission not granted');
          return null;
        }
        try {
          const addToHistory = () => {
            set((s) => ({
              notificationHistory: [
                {
                  id: Date.now(),
                  title,
                  body: options.body,
                  timestamp: new Date().toISOString(),
                },
                ...s.notificationHistory.slice(0, 49),
              ],
            }));
          };

          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(title, {
              icon: '/icons/icon-192x192.png',
              badge: '/icons/icon-192x192.png',
              vibrate: [200, 100, 200],
              ...options,
            });
            addToHistory();
            return null;
          } else {
            const notification = new Notification(title, {
              icon: '/icons/icon-192x192.png',
              ...options,
            });
            addToHistory();
            return notification;
          }
        } catch (error) {
          console.error('Error showing notification:', error);
          return null;
        }
      },

      clearHistory: () => set({ notificationHistory: [] }),

      initialize: () => {
        if ('Notification' in window) {
          set({ permission: Notification.permission as NotificationPermission });
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

if (typeof window !== 'undefined') {
  useNotificationStore.getState().initialize();
}
