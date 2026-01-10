// @babel/preset-env: Automatically determines the Babel plugins you need based on your supported environments
// @babel/preset-react: Adds support for React and JSX
// @babel/preset-typescript: Adds support for TypeScript

const isTest = process.env.NODE_ENV === 'test';

module.exports = function (api) {
  const isTestEnv = api.env('test');
  
  // Cache the configuration based on the environment
  api.cache.using(() => process.env.NODE_ENV);

  const presets = [
    ['@babel/preset-env', {
      // Use the minimum necessary polyfills based on the actual browsers used in .browserslistrc
      useBuiltIns: 'usage',
      corejs: { version: '3.36', proposals: true },
      // Don't transform modules in development to enable fast refresh
      modules: isTestEnv ? 'commonjs' : false,
      // Enable debug in development
      debug: process.env.NODE_ENV === 'development',
      // Target current node version for testing
      ...(isTestEnv && { targets: { node: 'current' } }),
    }],
    ['@babel/preset-react', {
      // Enable the new JSX transform (automatic runtime)
      runtime: 'automatic',
      // Enable development transforms in development
      development: process.env.NODE_ENV === 'development',
      // Use Emotion's JSX runtime
      importSource: '@emotion/react',
    }],
    '@babel/preset-typescript',
  ];

  const plugins = [
    // Transform dynamic imports (needed for Jest)
    isTestEnv && '@babel/plugin-transform-modules-commonjs',
    
    // Reuse Babel's injected helper code to save on code size
    ['@babel/plugin-transform-runtime', {
      corejs: false,
      helpers: true,
      regenerator: true,
      useESModules: !isTestEnv,
      version: '^7.23.0',
    }],

    // Modern JavaScript features
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
    '@babel/plugin-proposal-private-methods',
    '@babel/plugin-proposal-private-property-in-object',
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-logical-assignment-operators',
    
    // Emotion CSS prop support
    ['@emotion/babel-plugin', {
      sourceMap: process.env.NODE_ENV === 'development',
      autoLabel: 'dev-only',
      labelFormat: '[local]',
      cssPropOptimization: true,
    }],
    
    // Transform import.meta in test environment
    isTestEnv && './babel-plugin-transform-import-meta',
    
    // Better debugging with component names in React DevTools
    process.env.NODE_ENV === 'development' && 'react-refresh/babel',
  ].filter(Boolean);

  return {
    presets,
    plugins,
    // Source maps for better debugging
    sourceMaps: true,
    // Retain line numbers for better stack traces
    retainLines: true,
    // Required for using async/await in tests
    assumptions: {
      setPublicClassFields: true,
      privateFieldsAsProperties: true,
    },
  };
};
