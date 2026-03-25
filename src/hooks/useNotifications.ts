import { useCallback } from 'react';
import { useNotificationStore } from '../stores/notificationStore';

interface DriverData {
  name: string;
  eta: number;
  rating: number;
  vehicleType: string;
  [key: string]: unknown;
}

/**
 * Hook for managing push notifications
 */
export const useNotifications = () => {
  const {
    permission,
    enabled,
    hasRequestedPermission,
    requestPermission,
    showNotification,
    setEnabled,
    notificationHistory,
    clearHistory,
  } = useNotificationStore();

  const requestPermissionAfterMatch = useCallback(async (): Promise<boolean> => {
    if (!hasRequestedPermission && permission === 'default') {
      return await requestPermission();
    }
    return permission === 'granted';
  }, [hasRequestedPermission, permission, requestPermission]);

  const notifyDriverMatched = useCallback(
    async (driverData: DriverData): Promise<void> => {
      if (!enabled) return;
      const { name, eta, rating, vehicleType } = driverData;
      await showNotification('Driver Matched! 🚗', {
        body: `${name} is ${eta} minutes away\n${vehicleType} • ${rating}⭐`,
        tag: 'driver-match',
        requireInteraction: true,
        actions: [
          { action: 'view', title: 'View Details' },
          { action: 'cancel', title: 'Cancel' },
        ],
        data: { type: 'driver-match', driverData, url: '/dashboard/trips' },
      });
    },
    [enabled, showNotification]
  );

  const notifyTripUpdate = useCallback(
    async (message: string, tripData: unknown): Promise<void> => {
      if (!enabled) return;
      await showNotification('Trip Update', {
        body: message,
        tag: 'trip-update',
        data: { type: 'trip-update', tripData, url: '/dashboard/trips' },
      });
    },
    [enabled, showNotification]
  );

  const notifyDriverArriving = useCallback(
    async (driverName: string, eta: number): Promise<void> => {
      if (!enabled) return;
      await showNotification('Driver Arriving Soon! 🚕', {
        body: `${driverName} will arrive in ${eta} minute${eta !== 1 ? 's' : ''}`,
        tag: 'driver-arriving',
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200],
        data: { type: 'driver-arriving', url: '/dashboard/trips' },
      });
    },
    [enabled, showNotification]
  );

  const notifyPriceDrop = useCallback(
    async (oldPrice: string, newPrice: string, savings: string): Promise<void> => {
      if (!enabled) return;
      await showNotification('Price Drop Alert! 💰', {
        body: `Price dropped from ${oldPrice} to ${newPrice}\nSave ${savings}!`,
        tag: 'price-drop',
        requireInteraction: true,
        data: { type: 'price-drop', url: '/dashboard' },
      });
    },
    [enabled, showNotification]
  );

  const toggleNotifications = useCallback(
    async (enable: boolean): Promise<boolean> => {
      if (enable && permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) return false;
      }
      setEnabled(enable);
      return true;
    },
    [permission, requestPermission, setEnabled]
  );

  const isSupported = 'Notification' in window;

  return {
    permission,
    enabled,
    isSupported,
    hasRequestedPermission,
    notificationHistory,
    requestPermission,
    requestPermissionAfterMatch,
    toggleNotifications,
    clearHistory,
    notifyDriverMatched,
    notifyTripUpdate,
    notifyDriverArriving,
    notifyPriceDrop,
  };
};

export default useNotifications;
