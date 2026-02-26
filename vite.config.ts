import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.VERCEL ? '/' : '/Rewards_Hunter/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate heavy vendor libraries into their own chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-recharts': ['recharts'],
          'vendor-lucide': ['lucide-react'],
        },
      },
    },
  },
})
