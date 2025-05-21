/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

const isDevelopment = process.env.NODE_ENV === 'development';

// https://vitejs.dev/config/
export default defineConfig({
  base: isDevelopment ? '/' : './',
  server: {
    port: 5173,
    strictPort: true,
    open: true,
    // Enable HMR (Hot Module Replacement)
    hmr: {
      overlay: true,
    },
    // Enable CORS
    cors: true,
    // Proxy API requests if needed
    proxy: {
      // Example:
      // '/api': {
      //   target: 'http://localhost:3000',
      //   changeOrigin: true,
      //   secure: false,
      // },
    },
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../../shared'),
      // Fix for React 18 JSX runtime
      'react/jsx-runtime.js': 'react/jsx-runtime',
      'react/jsx-dev-runtime.js': 'react/jsx-dev-runtime',
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
      '@emotion/react',
      '@emotion/styled',
      'lucide-react',
      'date-fns',
      'date-fns-tz',
      'zod',
      'react-hook-form',
      '@hookform/resolvers',
    ],
    // Enable esbuild's tree shaking and optimizations
    esbuildOptions: {
      treeShaking: true,
      target: 'es2020',
      jsx: 'automatic',
      sourcemap: true,
    },
    // Force dependency pre-bundling
    force: true,
  },
  plugins: [
    react({
      // Use the new JSX runtime with automatic imports
      jsxRuntime: 'automatic',
      jsxImportSource: '@emotion/react',
      // Babel configuration
      babel: {
        plugins: [
          // Add Emotion CSS prop support
          '@emotion/babel-plugin',
        ],
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Astrobalendar',
        short_name: 'Astrobalendar',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/astrobalendar-logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/astrobalendar-logo-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        runtimeCaching: [
          {
            urlPattern: /\/api\/prediction\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'prediction-api',
              expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /\/assets\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
        ],
      },
      includeAssets: ['favicon.ico', 'robots.txt', 'astrobalendar-logo.png'],
    })
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    // Minify the output
    minify: 'terser',
    // Ensure proper chunking
    chunkSizeWarningLimit: 1000, // in kbs
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Fix for React 18
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      // Externalize react and react-dom to prevent duplication
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          vendor: ['@emotion/react', '@emotion/styled'],
        },
      },
      input: 'index.html'
    }
  },
  test: {
    globals: true,
    // Test environment configuration
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    // Handle CSS imports in tests
    css: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});
