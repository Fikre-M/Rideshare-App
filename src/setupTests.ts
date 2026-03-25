// @ts-nocheck

// import "@testing-library/jest-dom";


// TextEncoder / TextDecoder for Node test environment
if (typeof TextEncoder === "undefined") {
  global.TextEncoder = require("util").TextEncoder;
}
if (typeof TextDecoder === "undefined") {
  global.TextDecoder = require("util").TextDecoder;
}

// Basic window + navigator + storage mocks
const mockWindow = {
  location: new URL("http://localhost:8000"),
  navigator: {
    onLine: true,
    userAgent: "node.js",
    serviceWorker: {
      register: jest.fn().mockResolvedValue({}),
    },
  },
};

global.window = Object.assign(global.window || {}, mockWindow);

// Local/session storage mocks
const createStorageMock = () => {
  let store = {};
  return {
    getItem: jest.fn((key) => (key in store ? store[key] : null)),
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

global.localStorage = createStorageMock();
global.sessionStorage = createStorageMock();
global.navigator = mockWindow.navigator;

// Very lightweight DOM mock (only if not already provided by jsdom)
global.document = global.document || {
  createElement: jest.fn(() => ({})),
  querySelector: jest.fn(),
  querySelectorAll: jest.fn(),
  getElementById: jest.fn(),
  getElementsByClassName: jest.fn(),
  getElementsByTagName: jest.fn(),
};

// Vite env vars used in tests
process.env.VITE_API_URL = "http://localhost:8000/api";
process.env.VITE_WS_URL = "ws://localhost:8000";

// matchMedia mock
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// WebSocket mock
class WebSocketMock {
  constructor(url) {
    this.url = url;
    this.readyState = WebSocketMock.CONNECTING;
    this.onopen = null;
    this.onclose = null;
    this.onmessage = null;
    this.onerror = null;
    this.sentMessages = [];

    setTimeout(() => {
      this.readyState = WebSocketMock.OPEN;
      if (this.onopen) this.onopen();
    }, 0);
  }

  send(data) {
    this.sentMessages.push(JSON.parse(data));
  }

  close() {
    this.readyState = WebSocketMock.CLOSED;
    if (this.onclose) this.onclose({ code: 1000 });
  }
}

WebSocketMock.CONNECTING = 0;
WebSocketMock.OPEN = 1;
WebSocketMock.CLOSING = 2;
WebSocketMock.CLOSED = 3;

global.WebSocket = WebSocketMock;

// Keep console, but filter only the noisiest React warnings
const originalConsole = { ...console };

console.error = (...args) => {
  const errorMessage = args.join(" ");
  if (
    errorMessage.includes(
      "ReactDOM.render is no longer supported in React 18",
    ) ||
    errorMessage.includes("ReactDOMTestUtils.act is deprecated")
  ) {
    return;
  }
  originalConsole.error(...args);
};

console.warn = (...args) => {
  const msg = args[0] || "";
  if (
    msg.includes("ReactDOM.render is no longer supported in React 18") ||
    msg.includes("componentWillReceiveProps has been renamed") ||
    msg.includes("componentWillMount has been renamed") ||
    msg.includes("componentWillUpdate has been renamed") ||
    msg.includes("ReactDOMTestUtils.act is deprecated")
  ) {
    return;
  }
  originalConsole.warn(...args);
};

// IntersectionObserver mock
class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
}
global.IntersectionObserver = IntersectionObserver;

// ResizeObserver mock
class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}
global.ResizeObserver = ResizeObserver;
