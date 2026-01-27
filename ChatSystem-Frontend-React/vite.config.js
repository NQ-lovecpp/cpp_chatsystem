import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // 开发时代理后端 API，避免 CORS 问题
    proxy: {
      '/service': {
        target: 'http://127.0.0.1:9000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://127.0.0.1:9001',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
