import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
      clientPort: 5173,
      timeout: 5000,
      overlay: true
    },
    watch: {
      usePolling: true,
      interval: 1000
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  define: {
    'process.env': {
      NODE_ENV: process.env.NODE_ENV,
      VITE_API_URL: process.env.VITE_API_URL || 'http://localhost:3000',
      VITE_USE_REAL_API_ONLY: process.env.VITE_USE_REAL_API_ONLY || 'true',
      VITE_DISABLE_FALLBACKS: process.env.VITE_DISABLE_FALLBACKS || 'true'
    }
  }
}) 