import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      port: 8000,
      strictPort: false,
      open: true,
    },

    css: {
      postcss: "./postcss.config.cjs",
    },

    plugins: [
      react({
        jsxImportSource: "@emotion/react",
        babel: {
          plugins: ["@emotion/babel-plugin"],
        },
      }),
    ],

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
        "@mui/material",
        "jwt-decode",
        "lucide-react",
      ],
      exclude: [],
    },

    build: {
      sourcemap: true,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom"],
            vendor: [
              "@emotion/react",
              "@emotion/styled",
              "@mui/material",
              "@mui/icons-material",
              "jwt-decode",
              "lucide-react",
            ],
            // Add other vendor chunks as needed
          },
        },
      },
    },
  };
});
