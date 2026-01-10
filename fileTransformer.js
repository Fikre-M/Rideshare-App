// Mock for file imports
export default {
  process() {
    return 'module.exports = "test-file-stub";';
  },
  getCacheKey() {
    return 'fileTransform';
  },
};
