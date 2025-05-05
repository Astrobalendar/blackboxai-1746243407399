import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',  // Add this line
  root: 'public',  // Set root to public directory
  plugins: [vue()],
  define: {
    'process.env': {}
  },
  build: {
    outDir: '../dist'  // Ensure output is to dist directory
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
