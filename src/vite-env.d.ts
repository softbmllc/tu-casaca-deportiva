import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:4000",
    },
    fs: {
      strict: false,
    },
  },
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      // Si usás alias personalizados, los ponés acá
    },
  },
  // 👇 Esto es lo que hace el fallback sin romper Vite
  optimizeDeps: {
    include: ['react-router-dom'],
  },
});