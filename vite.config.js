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
  base: './',  // Capacitor 앱용 상대 경로
  server: {
    host: true,
    port: 8100,
  },
  // 환경변수는 .env 파일과 Vercel 환경변수에서 자동으로 로드됩니다
})

