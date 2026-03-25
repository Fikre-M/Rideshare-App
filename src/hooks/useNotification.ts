// @ts-nocheck
import { useCallback } from 'react';
import { useSnackbar } from 'notistack';

const useNotification = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const showNotification = useCallback(
    (message, options = {}) => {
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
    (message, options = {}) => {
      showNotification(message, { variant: 'success', ...options });
    },
    [showNotification]
  );

  const showError = useCallback(
    (message, options = {}) => {
      showNotification(message, { variant: 'error', ...options });
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (message, options = {}) => {
      showNotification(message, { variant: 'warning', ...options });
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (message, options = {}) => {
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
