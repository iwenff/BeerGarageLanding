import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// В dev-режиме Vite проксирует запросы к бэку чтобы не было конфликта портов.
// Фронт: localhost:3000  Бэк: Railway URL (или localhost:<другой порт> если локально)
const BACKEND_URL = process.env.BACKEND_URL || 'https://beergarage-back-production.up.railway.app'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/tables':       { target: BACKEND_URL, changeOrigin: true, secure: false },
      '/reservations': { target: BACKEND_URL, changeOrigin: true, secure: false },
      '/auth':         { target: BACKEND_URL, changeOrigin: true, secure: false },
      // /admin совпадает и с API-путями (/admin/reservations) и со страницами (/admin/login).
      // bypass: если браузер запрашивает HTML (навигация) — отдаём SPA, иначе — проксируем на бэк.
      '/admin': {
        target: BACKEND_URL,
        changeOrigin: true,
        secure: false,
        bypass(req) {
          if (req.headers.accept?.includes('text/html')) return '/index.html'
          return null
        },
      },
    },
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
})
