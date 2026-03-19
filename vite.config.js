import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      port: 8000,
      strictPort: false,
      open: true,
      proxy: {
        // Forward all /api/ai requests to the proxy server during development
        '/api/ai': {
          target: `http://localhost:${process.env.PROXY_PORT || 3001}`,
          changeOrigin: true,
          secure: false,
        },
      },
    },

    css: {
      postcss: "./postcss.config.cjs",
    },

    plugins: [
      react({
        jsxImportSource: "@emotion/react",
        babel: {
          plugins: [
            ["@emotion/babel-plugin", { 
              sourceMap: true,
              autoLabel: "dev-only"
            }]
          ],
        },
      }),
      // PWA Plugin
      VitePWA({
        registerType: 'prompt',
        includeAssets: ['favicon.ico', 'taxi.webp', 'robots.txt', 'icons/*.png'],
        manifest: {
          name: 'AI Rideshare Platform',
          short_name: 'AI Rideshare',
          description: 'AI-powered rideshare platform with smart matching, dynamic pricing, and route optimization',
          theme_color: '#1976d2',
          background_color: '#ffffff',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          orientation: 'portrait-primary',
          icons: [
            {
              src: '/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ],
          categories: ['travel', 'transportation', 'navigation'],
          shortcuts: [
            {
              name: 'Book a Ride',
              short_name: 'Book',
              description: 'Quickly book a new ride',
              url: '/dashboard?action=book',
              icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }]
            },
            {
              name: 'My Trips',
              short_name: 'Trips',
              description: 'View your trip history',
              url: '/dashboard/trips',
              icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }]
            }
          ]
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3 MiB
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
          globIgnores: ['**/stats.html', '**/stats.*.html'],
          runtimeCaching: [
            {
              // Cache app shell with CacheFirst strategy
              urlPattern: /^https:\/\/.*\.(js|css|html)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'app-shell-cache',
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              // Cache Mapbox tiles with StaleWhileRevalidate
              urlPattern: /^https:\/\/api\.mapbox\.com\/.*/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'mapbox-tiles-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              // Cache images with CacheFirst
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              // Cache fonts with CacheFirst
              urlPattern: /\.(?:woff|woff2|ttf|otf)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'fonts-cache',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              // DO NOT cache OpenAI API responses (dynamic and costly)
              urlPattern: /^https:\/\/api\.openai\.com\/.*/,
              handler: 'NetworkOnly',
            },
            {
              // API calls - NetworkFirst with short timeout
              urlPattern: /^https?:\/\/.*\/api\/.*/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 10,
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 5 * 60, // 5 minutes
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
          navigateFallback: '/offline.html',
          navigateFallbackDenylist: [/^\/api/, /^\/auth/],
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
        },
        devOptions: {
          enabled: false, // Disable in development for faster HMR
          type: 'module',
        },
      }),
      // Bundle analyzer - generates stats.html after build
      mode === "production" && visualizer({
        filename: "./dist/stats.html",
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),

    preview: {
      port: 3003,
      strictPort: true,
    },

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@pages": path.resolve(__dirname, "./src/pages"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
        "@utils": path.resolve(__dirname, "./src/utils"),
        "@assets": path.resolve(__dirname, "./src/assets"),
        "@context": path.resolve(__dirname, "./src/context"),
      },
    },

    define: {
      // Single define property that combines both environment variable approaches
      ...(mode === "development" ? { "process.env": process.env } : {}),
      // Vite environment variables (prefixed with VITE_)
      ...Object.entries(env).reduce((acc, [key, val]) => {
        if (key.startsWith("VITE_")) {
          acc[`import.meta.env.${key}`] = JSON.stringify(val);
        }
        return acc;
      }, {}),
      // Global constants
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },

    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "@emotion/react",
        "@emotion/styled",
        "jwt-decode",
        "lucide-react",
      ],
      exclude: [],
    },

    build: {
      sourcemap: true,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {},
      },
    },
  };
});
