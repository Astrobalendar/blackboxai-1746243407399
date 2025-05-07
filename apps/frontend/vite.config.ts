import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  define: {
    'process.env': {}, // Polyfill `process.env` for the browser
  },
  base: './',
  plugins: [react()],
  build: {
    outDir: '../../dist', // Outputs to the correct directory relative to the frontend folder
    emptyOutDir: true,
    sourcemap: true, // Enable source maps for production builds
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'], // Separate vendor libraries
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Adjust the warning limit if needed
  },
});
