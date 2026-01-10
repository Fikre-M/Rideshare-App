// Handle asset imports in tests
const path = require('path');

module.exports = async () => {
  // Mock for file imports
  if (typeof window !== 'undefined') {
    // Mock window.scrollTo
    window.scrollTo = () => {};
    
    // Mock IntersectionObserver
    global.IntersectionObserver = class IntersectionObserver {
      constructor() {}
      disconnect() {}
      observe() {}
      unobserve() {}
    };
  }
};

// Mock for file imports
module.exports = {
  process() {
    return { code: 'module.exports = {};' };
  },
  getCacheKey() {
    return 'transform';
  },
};

// Mock for CSS modules
module.exports = {
  process() {
    return 'module.exports = new Proxy({}, { get: (_, className) => className });';
  },
};

// Mock for image imports
module.exports = {
  process() {
    return 'module.exports = "test-file-stub";';
  },
};
