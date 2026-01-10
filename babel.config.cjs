// babel.config.cjs
module.exports = {
  presets: [
    ['@babel/preset-env', { 
      targets: { 
        node: 'current',
        browsers: ['>0.2%', 'not dead', 'not op_mini all']
      },
      modules: false,
      useBuiltIns: 'usage',
      corejs: 3
    }],
    ['@babel/preset-react', { 
      runtime: 'automatic',
      development: process.env.NODE_ENV === 'development',
    }],
    '@babel/preset-typescript',
  ],
  plugins: [
    ['@babel/plugin-transform-runtime', {
      corejs: 3,
      helpers: true,
      regenerator: true,
      useESModules: true
    }],
    '@babel/plugin-transform-modules-commonjs',
    process.env.NODE_ENV !== 'production' && 'react-refresh/babel',
  ].filter(Boolean),
  env: {
    test: {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }],
      ],
    },
  },
};