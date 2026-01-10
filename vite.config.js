import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), '');

  return {
    css: {
      postcss: './postcss.config.cjs'
    },
    plugins: [
      react({
        jsxImportSource: '@emotion/react',
        babel: {
          plugins: ['@emotion/babel-plugin'],
        },
      }),
      mode === 'analyze' && visualizer({
        open: true,
        filename: 'dist/stats.html',
      }),
    ].filter(Boolean),
    
    server: {
      port: 8000,
      open: true,
      strictPort: true,
    },
    
    preview: {
      port: 8000,
      strictPort: true,
    },
    
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, './src') },
        { find: '@components', replacement: path.resolve(__dirname, './src/components') },
        { find: '@pages', replacement: path.resolve(__dirname, './src/pages') },
        { find: '@hooks', replacement: path.resolve(__dirname, './src/hooks') },
        { find: '@utils', replacement: path.resolve(__dirname, './src/utils') },
        { find: '@assets', replacement: path.resolve(__dirname, './src/assets') },
        { find: '@context', replacement: path.resolve(__dirname, './src/context') },
      ],
    },
    
    // Optimize dependencies for better performance
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@emotion/react',
        '@emotion/styled',
        '@mui/material',
      ],
      esbuildOptions: {
        // Enable esbuild polyfill for Node.js global objects
        define: {
          global: 'globalThis',
        },
      },
    },
    
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            vendor: ['@emotion/react', '@emotion/styled', '@mui/material'],
            utils: ['date-fns', 'axios', 'zod'],
          },
        },
      },
      chunkSizeWarningLimit: 1000, // in kbs
    },
    
    // Environment variables
    define: {
      'process.env': {
        ...Object.entries(env).reduce((acc, [key, val]) => {
          if (key.startsWith('VITE_')) {
            acc[key] = JSON.stringify(val);
          }
          return acc;
        }, {}),
      },
    },
  };
});