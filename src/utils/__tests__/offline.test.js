import { renderHook, act } from '@testing-library/react-hooks';
import { useOfflineStatus, registerServiceWorker } from '../offline';

describe('useOfflineStatus', () => {
  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(window, 'navigator', {
      value: { onLine: true },
      writable: true,
    });
    
    // Mock window events
    window.addEventListener = jest.fn();
    window.removeEventListener = jest.fn();
  });

  it('should return initial online status', () => {
    const { result } = renderHook(() => useOfflineStatus());
    expect(result.current).toBe(false);
  });

  it('should update status when going offline', () => {
    const { result } = renderHook(() => useOfflineStatus());
    
    // Simulate going offline
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    
    expect(result.current).toBe(true);
  });

  it('should update status when going online', () => {
    // Start offline
    Object.defineProperty(window.navigator, 'onLine', { value: false });
    
    const { result } = renderHook(() => useOfflineStatus());
    
    // Simulate going online
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    
    expect(result.current).toBe(false);
  });

  it('should clean up event listeners', () => {
    const { unmount } = renderHook(() => useOfflineStatus());
    
    unmount();
    
    expect(window.removeEventListener).toHaveBeenCalledTimes(2);
    expect(window.removeEventListener).toHaveBeenCalledWith('online', expect.any(Function));
    expect(window.removeEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
  });
});

describe('registerServiceWorker', () => {
  beforeEach(() => {
    // Mock serviceWorker
    Object.defineProperty(window.navigator, 'serviceWorker', {
      value: {
        register: jest.fn().mockResolvedValue({}),
      },
      writable: true,
    });
    
    // Reset mocks
    jest.clearAllMocks();
  });

  it('should register service worker when available', async () => {
    await registerServiceWorker();
    
    expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js');
  });

  it('should handle service worker registration failure', async () => {
    const error = new Error('Registration failed');
    navigator.serviceWorker.register.mockRejectedValueOnce(error);
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    await registerServiceWorker();
    
    expect(consoleSpy).toHaveBeenCalledWith('ServiceWorker registration failed:', error);
    consoleSpy.mockRestore();
  });

  it('should not throw when service workers are not supported', async () => {
    // Simulate service worker not being available
    delete window.navigator.serviceWorker;
    
    await expect(registerServiceWorker()).resolves.toBeUndefined();
  });
});
