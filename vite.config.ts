/// <reference types="node" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'
import * as fs from 'fs'

// SSL certificate paths
const SSL_CERT_PATH = "X:/letsencrypt/live/24gatel.eu/fullchain.pem"
const SSL_KEY_PATH = "X:/letsencrypt/live/24gatel.eu/privkey.pem"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 8083,
    strictPort: true,
    open: 'https://localhost:8083',
    https: {
      key: fs.readFileSync(SSL_KEY_PATH),
      cert: fs.readFileSync(SSL_CERT_PATH),
    },
    hmr: {
      host: "24gatel.eu",
      protocol: "wss",
      clientPort: 8083
    },
    fs: {
      allow: [
        path.resolve(__dirname),
        path.resolve(__dirname, 'public')
      ]
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 8083,
    strictPort: true,
    open: 'https://localhost:8083',
    https: {
      key: fs.readFileSync(SSL_KEY_PATH),
      cert: fs.readFileSync(SSL_CERT_PATH),
    }
  },
  resolve: {
    alias: {
      'src': path.resolve(__dirname, 'src'),
    }
  },
  build: {
    outDir: 'web',
    assetsInlineLimit: 0,
    emptyOutDir: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            // Exclude react and react-dom from vendor chunk
            if (id.includes('react') || id.includes('react-dom')) {
              return undefined
            }
            return 'vendor'
          }
        }
      }
    }
  }
})
