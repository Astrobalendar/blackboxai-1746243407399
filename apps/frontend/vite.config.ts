import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {

    base: './',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@shared': path.resolve(__dirname, '../../shared'),
      },
    },
    plugins: [
      react(),
      require('vite-plugin-pwa').VitePWA({
        registerType: 'autoUpdate',
        manifest: './public/manifest.webmanifest',
        workbox: {
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
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        input: 'index.html'
      }
    }
  };
});
