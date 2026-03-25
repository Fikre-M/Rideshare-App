import { useCallback } from 'react';
import { useSnackbar, OptionsObject } from 'notistack';

interface NotificationOptions extends Omit<OptionsObject, 'variant'> {
  variant?: 'default' | 'error' | 'success' | 'warning' | 'info';
  autoHideDuration?: number;
  persist?: boolean;
}

const useNotification = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const showNotification = useCallback(
    (message: string, options: NotificationOptions = {}) => {
      const {
        variant = 'default',
        autoHideDuration = 3000,
        persist = false,
        ...rest
      } = options;

      enqueueSnackbar(message, {
        variant,
        autoHideDuration: persist ? null : autoHideDuration,
        ...rest,
      });
    },
    [enqueueSnackbar]
  );

  const showSuccess = useCallback(
    (message: string, options: NotificationOptions = {}) => {
      showNotification(message, { variant: 'success', ...options });
    },
    [showNotification]
  );

  const showError = useCallback(
    (message: string, options: NotificationOptions = {}) => {
      showNotification(message, { variant: 'error', ...options });
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (message: string, options: NotificationOptions = {}) => {
      showNotification(message, { variant: 'warning', ...options });
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (message: string, options: NotificationOptions = {}) => {
      showNotification(message, { variant: 'info', ...options });
    },
    [showNotification]
  );

  return {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    closeNotification: closeSnackbar,
  };
};

export default useNotification;
