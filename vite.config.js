import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'sites/ruta/index.html'),
        admin: resolve(__dirname, 'admin/index.html'),
        'business-admin': resolve(__dirname, 'business-admin/index.html')
      }
    }
  }
})