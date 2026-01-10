import '@testing-library/jest-dom';

// Mock environment variables
process.env.VITE_API_URL = 'http://localhost:3000/api';
process.env.VITE_WS_URL = 'ws://localhost:3000';

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

// Mock navigator
Object.defineProperty(window, 'navigator', {
  value: {
    onLine: true,
    userAgent: 'node.js',
    serviceWorker: {
      register: jest.fn().mockResolvedValue({}),
    },
  },
  writable: true,
  configurable: true,
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

// Mock console methods
const originalConsole = { ...console };

// Only throw on actual errors, not warnings
console.error = (...args) => {
  originalConsole.error(...args);
  if (process.env.NODE_ENV === 'test') {
    const errorMessage = args.join(' ');
    // Don't fail on certain warnings
    if (!errorMessage.includes('ReactDOM.render is no longer supported in React 18')) {
      throw new Error(`Console.error was called: ${errorMessage}`);
    }
  }
};

// Suppress specific warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  const msg = args[0] || '';
  // Suppress specific warnings
  if (
    msg.includes('ReactDOM.render is no longer supported in React 18') ||
    msg.includes('componentWillReceiveProps has been renamed') ||
    msg.includes('componentWillMount has been renamed') ||
    msg.includes('componentWillUpdate has been renamed')
  ) {
    return;
  }
  originalWarn(...args);
};

// Mock IntersectionObserver
class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() { return []; }
}

window.IntersectionObserver = IntersectionObserver;

// Mock ResizeObserver
class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

window.ResizeObserver = ResizeObserver;

// Mock React 19 specific APIs
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useId: () => 'test-id',
  useTransition: () => [false, (fn) => Promise.resolve(fn())],
  useDeferredValue: (value) => value,
}));
