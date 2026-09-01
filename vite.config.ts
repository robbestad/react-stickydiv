import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  root: 'playground',
  plugins: [react()],
  resolve: {
    alias: {
      'react-stickydiv': fileURLToPath(
        new URL('./src/index.ts', import.meta.url),
      ),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
  // Keep Vite from treating the repo root as a second project root.
  cacheDir: `${root}/node_modules/.vite`,
})
