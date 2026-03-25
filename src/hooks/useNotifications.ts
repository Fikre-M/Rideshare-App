// @ts-nocheck
import { useEffect, useCallback } from 'react';
import { useNotificationStore } from '../stores/notificationStore';

/**
 * Hook for managing push notifications
 * @returns {Object} Notification utilities
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

  // Request permission after first successful AI match
  const requestPermissionAfterMatch = useCallback(async () => {
    if (!hasRequestedPermission && permission === 'default') {
      const granted = await requestPermission();
      return granted;
    }
    return permission === 'granted';
  }, [hasRequestedPermission, permission, requestPermission]);

  // Show driver matched notification
  const notifyDriverMatched = useCallback(
    async (driverData) => {
      if (!enabled) return;

      const { name, eta, rating, vehicleType } = driverData;

      await showNotification('Driver Matched! 🚗', {
        body: `${name} is ${eta} minutes away\n${vehicleType} • ${rating}⭐`,
        tag: 'driver-match',
        requireInteraction: true,
        actions: [
          {
            action: 'view',
            title: 'View Details',
          },
          {
            action: 'cancel',
            title: 'Cancel',
          },
        ],
        data: {
          type: 'driver-match',
          driverData,
          url: '/dashboard/trips',
        },
      });
    },
    [enabled, showNotification]
  );

  // Show trip update notification
  const notifyTripUpdate = useCallback(
    async (message, tripData) => {
      if (!enabled) return;

      await showNotification('Trip Update', {
        body: message,
        tag: 'trip-update',
        data: {
          type: 'trip-update',
          tripData,
          url: '/dashboard/trips',
        },
      });
    },
    [enabled, showNotification]
  );

  // Show arrival notification
  const notifyDriverArriving = useCallback(
    async (driverName, eta) => {
      if (!enabled) return;

      await showNotification('Driver Arriving Soon! 🚕', {
        body: `${driverName} will arrive in ${eta} minute${eta !== 1 ? 's' : ''}`,
        tag: 'driver-arriving',
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200],
        data: {
          type: 'driver-arriving',
          url: '/dashboard/trips',
        },
      });
    },
    [enabled, showNotification]
  );

  // Show price drop notification
  const notifyPriceDrop = useCallback(
    async (oldPrice, newPrice, savings) => {
      if (!enabled) return;

      await showNotification('Price Drop Alert! 💰', {
        body: `Price dropped from $${oldPrice} to $${newPrice}\nSave $${savings}!`,
        tag: 'price-drop',
        requireInteraction: true,
        data: {
          type: 'price-drop',
          url: '/dashboard',
        },
      });
    },
    [enabled, showNotification]
  );

  // Toggle notifications
  const toggleNotifications = useCallback(
    async (enable) => {
      if (enable && permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          return false;
        }
      }
      setEnabled(enable);
      return true;
    },
    [permission, requestPermission, setEnabled]
  );

  // Check if notifications are supported
  const isSupported = 'Notification' in window;

  return {
    // State
    permission,
    enabled,
    isSupported,
    hasRequestedPermission,
    notificationHistory,

    // Actions
    requestPermission,
    requestPermissionAfterMatch,
    toggleNotifications,
    clearHistory,

    // Notification helpers
    notifyDriverMatched,
    notifyTripUpdate,
    notifyDriverArriving,
    notifyPriceDrop,
  };
};

export default useNotifications;
