import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Disable PWA plugin on Vercel/CI builds to avoid Rolldown bundle assignment errors
    ...(process.env.VERCEL || process.env.CI || process.env.NODE_ENV === "production"
      ? []
      : [
          VitePWA({
            registerType: "autoUpdate",
            includeAssets: ["favicon.png", "favicon.svg", "logo.png", "robots.txt"],
            manifest: {
              name: "Starbucks Egypt | ستاربكس مصر",
              short_name: "Starbucks EG",
              description: "Official Starbucks Egypt Portal - Experience the world's best coffee",
              theme_color: "#006241",
              background_color: "#ffffff",
              display: "standalone",
              orientation: "portrait-primary",
              icons: [
                {
                  src: "/favicon.png",
                  sizes: "512x512",
                  type: "image/png",
                  purpose: "any maskable",
                },
                {
                  src: "/favicon.svg",
                  sizes: "any",
                  type: "image/svg+xml",
                },
                {
                  src: "/logo.png",
                  sizes: "512x512",
                  type: "image/png",
                },
              ],
              shortcuts: [
                {
                  name: "Menu | قائمة الطعام",
                  short_name: "Menu",
                  url: "/ar/menu",
                  icons: [{ src: "/favicon.png", sizes: "192x192" }],
                },
                {
                  name: "Locations | مواقعنا",
                  short_name: "Locations",
                  url: "/ar/locations",
                  icons: [{ src: "/favicon.png", sizes: "192x192" }],
                },
              ],
              categories: ["food", "drink", "lifestyle"],
              lang: "ar",
              dir: "rtl",
              start_url: "/",
              scope: "/",
            },
            workbox: {
              globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],
              runtimeCaching: [
                {
                  urlPattern: /\.(?:png|jpg|jpeg|svg|webp|avif)$/,
                  handler: "StaleWhileRevalidate",
                  options: {
                    cacheName: "local-images",
                    expiration: {
                      maxEntries: 50,
                    },
                  },
                },
                {
                  urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
                  handler: "CacheFirst",
                  options: {
                    cacheName: "google-fonts",
                    expiration: {
                      maxEntries: 30,
                      maxAgeSeconds: 60 * 60 * 24 * 365,
                    },
                  },
                },
              ],
            },
            devOptions: {
              enabled: false,
            },
          }),
        ]),
  ],
  // Inject GOOGLE_API_KEY secret (available in Node/Replit env) as the
  // VITE_-prefixed variable the browser bundle needs. The define option
  // takes precedence over any .env file value.
  define: {
    'import.meta.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(
      process.env.GOOGLE_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || ''
    ),
  },
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "./src"),
      },
    ],
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "framer-motion",
      "@tanstack/react-query",
      "react-i18next",
      "i18next",
    ],
  },
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Keep Sentry's React integration in its own async chunk. Checking
            // it before the generic React rule prevents it being pulled into the
            // initial React vendor chunk by its package name.
            if (id.includes("/@sentry/")) {
              return "sentry-vendor";
            }
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router")
            ) {
              return "react-vendor";
            }
            if (id.includes("framer-motion")) {
              return "motion-vendor";
            }
            if (
              id.includes("clsx") ||
              id.includes("tailwind-merge")
            ) {
              return "ui-vendor";
            }

            if (id.includes("i18next")) {
              return "i18n-vendor";
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      "/health": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
