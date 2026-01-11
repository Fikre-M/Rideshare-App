// vite.config.js
import { defineConfig, loadEnv } from "file:///C:/Users/fikre/transportation/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/fikre/transportation/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
var __vite_injected_original_dirname = "C:\\Users\\fikre\\transportation";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    server: {
      port: 3002,
      strictPort: true,
      open: true
    },
    css: {
      postcss: "./postcss.config.cjs"
    },
    plugins: [
      react({
        jsxImportSource: "@emotion/react",
        babel: {
          plugins: ["@emotion/babel-plugin"]
        }
      })
    ],
    preview: {
      port: 3003,
      strictPort: true
    },
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src"),
        "@components": path.resolve(__vite_injected_original_dirname, "./src/components"),
        "@pages": path.resolve(__vite_injected_original_dirname, "./src/pages"),
        "@hooks": path.resolve(__vite_injected_original_dirname, "./src/hooks"),
        "@utils": path.resolve(__vite_injected_original_dirname, "./src/utils"),
        "@assets": path.resolve(__vite_injected_original_dirname, "./src/assets"),
        "@context": path.resolve(__vite_injected_original_dirname, "./src/context")
      }
    },
    define: {
      // Single define property that combines both environment variable approaches
      ...mode === "development" ? { "process.env": process.env } : {},
      // Vite environment variables (prefixed with VITE_)
      ...Object.entries(env).reduce((acc, [key, val]) => {
        if (key.startsWith("VITE_")) {
          acc[`import.meta.env.${key}`] = JSON.stringify(val);
        }
        return acc;
      }, {}),
      // Global constants
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
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
        "lucide-react"
      ],
      exclude: []
    },
    build: {
      sourcemap: true,
      chunkSizeWarningLimit: 1e3,
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
              "lucide-react"
            ]
            // Add other vendor chunks as needed
          }
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxmaWtyZVxcXFx0cmFuc3BvcnRhdGlvblwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcZmlrcmVcXFxcdHJhbnNwb3J0YXRpb25cXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2Zpa3JlL3RyYW5zcG9ydGF0aW9uL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgLy8gTG9hZCBlbnZpcm9ubWVudCB2YXJpYWJsZXNcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCBcIlwiKTtcblxuICByZXR1cm4ge1xuICAgIHNlcnZlcjoge1xuICAgICAgcG9ydDogMzAwMixcbiAgICAgIHN0cmljdFBvcnQ6IHRydWUsXG4gICAgICBvcGVuOiB0cnVlLFxuICAgIH0sXG5cbiAgICBjc3M6IHtcbiAgICAgIHBvc3Rjc3M6IFwiLi9wb3N0Y3NzLmNvbmZpZy5janNcIixcbiAgICB9LFxuXG4gICAgcGx1Z2luczogW1xuICAgICAgcmVhY3Qoe1xuICAgICAgICBqc3hJbXBvcnRTb3VyY2U6IFwiQGVtb3Rpb24vcmVhY3RcIixcbiAgICAgICAgYmFiZWw6IHtcbiAgICAgICAgICBwbHVnaW5zOiBbXCJAZW1vdGlvbi9iYWJlbC1wbHVnaW5cIl0sXG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICBdLFxuXG4gICAgcHJldmlldzoge1xuICAgICAgcG9ydDogMzAwMyxcbiAgICAgIHN0cmljdFBvcnQ6IHRydWUsXG4gICAgfSxcblxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgICAgICBcIkBjb21wb25lbnRzXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmMvY29tcG9uZW50c1wiKSxcbiAgICAgICAgXCJAcGFnZXNcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyYy9wYWdlc1wiKSxcbiAgICAgICAgXCJAaG9va3NcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyYy9ob29rc1wiKSxcbiAgICAgICAgXCJAdXRpbHNcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyYy91dGlsc1wiKSxcbiAgICAgICAgXCJAYXNzZXRzXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmMvYXNzZXRzXCIpLFxuICAgICAgICBcIkBjb250ZXh0XCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmMvY29udGV4dFwiKSxcbiAgICAgIH0sXG4gICAgfSxcblxuICAgIGRlZmluZToge1xuICAgICAgLy8gU2luZ2xlIGRlZmluZSBwcm9wZXJ0eSB0aGF0IGNvbWJpbmVzIGJvdGggZW52aXJvbm1lbnQgdmFyaWFibGUgYXBwcm9hY2hlc1xuICAgICAgLi4uKG1vZGUgPT09IFwiZGV2ZWxvcG1lbnRcIiA/IHsgXCJwcm9jZXNzLmVudlwiOiBwcm9jZXNzLmVudiB9IDoge30pLFxuICAgICAgLy8gVml0ZSBlbnZpcm9ubWVudCB2YXJpYWJsZXMgKHByZWZpeGVkIHdpdGggVklURV8pXG4gICAgICAuLi5PYmplY3QuZW50cmllcyhlbnYpLnJlZHVjZSgoYWNjLCBba2V5LCB2YWxdKSA9PiB7XG4gICAgICAgIGlmIChrZXkuc3RhcnRzV2l0aChcIlZJVEVfXCIpKSB7XG4gICAgICAgICAgYWNjW2BpbXBvcnQubWV0YS5lbnYuJHtrZXl9YF0gPSBKU09OLnN0cmluZ2lmeSh2YWwpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhY2M7XG4gICAgICB9LCB7fSksXG4gICAgICAvLyBHbG9iYWwgY29uc3RhbnRzXG4gICAgICBfX0FQUF9WRVJTSU9OX186IEpTT04uc3RyaW5naWZ5KHByb2Nlc3MuZW52Lm5wbV9wYWNrYWdlX3ZlcnNpb24pLFxuICAgIH0sXG5cbiAgICBvcHRpbWl6ZURlcHM6IHtcbiAgICAgIGluY2x1ZGU6IFtcbiAgICAgICAgXCJyZWFjdFwiLFxuICAgICAgICBcInJlYWN0LWRvbVwiLFxuICAgICAgICBcInJlYWN0LXJvdXRlci1kb21cIixcbiAgICAgICAgXCJAZW1vdGlvbi9yZWFjdFwiLFxuICAgICAgICBcIkBlbW90aW9uL3N0eWxlZFwiLFxuICAgICAgICBcIkBtdWkvbWF0ZXJpYWxcIixcbiAgICAgICAgXCJqd3QtZGVjb2RlXCIsXG4gICAgICAgIFwibHVjaWRlLXJlYWN0XCIsXG4gICAgICBdLFxuICAgICAgZXhjbHVkZTogW10sXG4gICAgfSxcblxuICAgIGJ1aWxkOiB7XG4gICAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgICAgcmVhY3Q6IFtcInJlYWN0XCIsIFwicmVhY3QtZG9tXCIsIFwicmVhY3Qtcm91dGVyLWRvbVwiXSxcbiAgICAgICAgICAgIHZlbmRvcjogW1xuICAgICAgICAgICAgICBcIkBlbW90aW9uL3JlYWN0XCIsXG4gICAgICAgICAgICAgIFwiQGVtb3Rpb24vc3R5bGVkXCIsXG4gICAgICAgICAgICAgIFwiQG11aS9tYXRlcmlhbFwiLFxuICAgICAgICAgICAgICBcIkBtdWkvaWNvbnMtbWF0ZXJpYWxcIixcbiAgICAgICAgICAgICAgXCJqd3QtZGVjb2RlXCIsXG4gICAgICAgICAgICAgIFwibHVjaWRlLXJlYWN0XCIsXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgLy8gQWRkIG90aGVyIHZlbmRvciBjaHVua3MgYXMgbmVlZGVkXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFpUixTQUFTLGNBQWMsZUFBZTtBQUN2VCxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBRmpCLElBQU0sbUNBQW1DO0FBSXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBRXhDLFFBQU0sTUFBTSxRQUFRLE1BQU0sUUFBUSxJQUFJLEdBQUcsRUFBRTtBQUUzQyxTQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixZQUFZO0FBQUEsTUFDWixNQUFNO0FBQUEsSUFDUjtBQUFBLElBRUEsS0FBSztBQUFBLE1BQ0gsU0FBUztBQUFBLElBQ1g7QUFBQSxJQUVBLFNBQVM7QUFBQSxNQUNQLE1BQU07QUFBQSxRQUNKLGlCQUFpQjtBQUFBLFFBQ2pCLE9BQU87QUFBQSxVQUNMLFNBQVMsQ0FBQyx1QkFBdUI7QUFBQSxRQUNuQztBQUFBLE1BQ0YsQ0FBQztBQUFBLElBQ0g7QUFBQSxJQUVBLFNBQVM7QUFBQSxNQUNQLE1BQU07QUFBQSxNQUNOLFlBQVk7QUFBQSxJQUNkO0FBQUEsSUFFQSxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsUUFDcEMsZUFBZSxLQUFLLFFBQVEsa0NBQVcsa0JBQWtCO0FBQUEsUUFDekQsVUFBVSxLQUFLLFFBQVEsa0NBQVcsYUFBYTtBQUFBLFFBQy9DLFVBQVUsS0FBSyxRQUFRLGtDQUFXLGFBQWE7QUFBQSxRQUMvQyxVQUFVLEtBQUssUUFBUSxrQ0FBVyxhQUFhO0FBQUEsUUFDL0MsV0FBVyxLQUFLLFFBQVEsa0NBQVcsY0FBYztBQUFBLFFBQ2pELFlBQVksS0FBSyxRQUFRLGtDQUFXLGVBQWU7QUFBQSxNQUNyRDtBQUFBLElBQ0Y7QUFBQSxJQUVBLFFBQVE7QUFBQTtBQUFBLE1BRU4sR0FBSSxTQUFTLGdCQUFnQixFQUFFLGVBQWUsUUFBUSxJQUFJLElBQUksQ0FBQztBQUFBO0FBQUEsTUFFL0QsR0FBRyxPQUFPLFFBQVEsR0FBRyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLE1BQU07QUFDakQsWUFBSSxJQUFJLFdBQVcsT0FBTyxHQUFHO0FBQzNCLGNBQUksbUJBQW1CLEdBQUcsRUFBRSxJQUFJLEtBQUssVUFBVSxHQUFHO0FBQUEsUUFDcEQ7QUFDQSxlQUFPO0FBQUEsTUFDVCxHQUFHLENBQUMsQ0FBQztBQUFBO0FBQUEsTUFFTCxpQkFBaUIsS0FBSyxVQUFVLFFBQVEsSUFBSSxtQkFBbUI7QUFBQSxJQUNqRTtBQUFBLElBRUEsY0FBYztBQUFBLE1BQ1osU0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLE1BQ0EsU0FBUyxDQUFDO0FBQUEsSUFDWjtBQUFBLElBRUEsT0FBTztBQUFBLE1BQ0wsV0FBVztBQUFBLE1BQ1gsdUJBQXVCO0FBQUEsTUFDdkIsZUFBZTtBQUFBLFFBQ2IsUUFBUTtBQUFBLFVBQ04sY0FBYztBQUFBLFlBQ1osT0FBTyxDQUFDLFNBQVMsYUFBYSxrQkFBa0I7QUFBQSxZQUNoRCxRQUFRO0FBQUEsY0FDTjtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsY0FDQTtBQUFBLGNBQ0E7QUFBQSxjQUNBO0FBQUEsWUFDRjtBQUFBO0FBQUEsVUFFRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
