import { defineConfig } from 'vite'

export default defineConfig({
  root: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
  },
  server: {
    open: true,
    port: 3000
  }
}) 