import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Hefti-Academy/',
  build: {
    chunkSizeWarningLimit: 1000, // in KB
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    assetsDir: 'assets',
    sourcemap: true,
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
  },
})
