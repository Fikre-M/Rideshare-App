module.exports = {
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",

    // Fix ALL import.meta.env in one line
    "^import\\.meta\\.env$": "{}",
  },
};
