import { renderHook, act } from "@testing-library/react";
import { useOfflineStatus, registerServiceWorker } from "../offline";


beforeAll(() => {
  Object.defineProperty(global.navigator, "serviceWorker", {
    value: { register: jest.fn().mockResolvedValue({}) },
    writable: true,
  });
});

describe("useOfflineStatus", () => {
  beforeEach(() => {
    Object.defineProperty(window.navigator, "onLine", {
      value: true,
      writable: true,
    });

    jest.clearAllMocks();
  });

  it("should return initial online status", () => {
    const { result } = renderHook(() => useOfflineStatus());
    expect(result.current).toBe(false);
  });

  it("should update status when going offline", () => {
    const { result } = renderHook(() => useOfflineStatus());

    act(() => {
      Object.defineProperty(window.navigator, "onLine", { value: false });
    });

    const { result: updatedResult } = renderHook(() => useOfflineStatus());
    expect(updatedResult.current).toBe(true);
  });

  it("should update status when going online", () => {
    Object.defineProperty(window.navigator, "onLine", { value: false });

    const { result } = renderHook(() => useOfflineStatus());

    act(() => {
      Object.defineProperty(window.navigator, "onLine", { value: true });
    });

    const { result: updatedResult } = renderHook(() => useOfflineStatus());
    expect(updatedResult.current).toBe(false);
  });
});

describe("registerServiceWorker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should register service worker when available", async () => {
    await registerServiceWorker();
    expect(navigator.serviceWorker.register).toHaveBeenCalled();
  });
});
