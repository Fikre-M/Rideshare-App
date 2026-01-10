import '@testing-library/jest-dom';

// Mock environment variables
process.env.VITE_API_URL = 'http://localhost:5000/api';
process.env.VITE_WS_URL = 'ws://localhost:5000';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Storage mocks
const createStorageMock = () => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
};

Object.defineProperties(window, {
  localStorage: { value: createStorageMock() },
  sessionStorage: { value: createStorageMock() },
});

// WebSocket mock
class WebSocketMock {
  constructor(url) {
    this.url = url;
    this.readyState = WebSocket.CONNECTING;
    this.onopen = null;
    this.onclose = null;
    this.onmessage = null;
    this.onerror = null;
    this.sentMessages = [];
    
    // Simulate connection
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) this.onopen();
    }, 0);
  }

  send(data) {
    this.sentMessages.push(JSON.parse(data));
  }

  close() {
    this.readyState = WebSocket.CLOSED;
    if (this.onclose) this.onclose({ code: 1000 });
  }
}

global.WebSocket = WebSocketMock;

// Mock service worker registration
const mockRegister = jest.fn().mockResolvedValue({});
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: mockRegister,
  },
  configurable: true,
});

// Mock console methods
const originalConsole = { ...console };
const throwOnConsoleError = (method) => {
  console[method] = (...args) => {
    originalConsole[method](...args);
    if (process.env.NODE_ENV === 'test') {
      throw new Error(`Console.${method} was called. Failing test...`);
    }
  };
};

['error', 'warn'].forEach(throwOnConsoleError);

// Mock React 19 specific APIs
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useId: () => 'test-id',
  useTransition: () => [false, (fn) => Promise.resolve(fn())],
  useDeferredValue: (value) => value,
}));
