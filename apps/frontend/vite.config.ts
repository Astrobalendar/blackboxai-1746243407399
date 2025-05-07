import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  define: {
    'process.env': {}, // Polyfill `process.env` for the browser
  },
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist', // Output to dist directory within frontend folder
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
