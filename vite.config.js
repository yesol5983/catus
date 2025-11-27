import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'not IE 11', 'Android >= 7'],
    }),
  ],
  base: '/',  // 절대 경로 (Vercel + Capacitor 모두 지원)
  server: {
    host: true,
    port: 8100,
  },
  // 환경변수는 .env 파일과 Vercel 환경변수에서 자동으로 로드됩니다
})

