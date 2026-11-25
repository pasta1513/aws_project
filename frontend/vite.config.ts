import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

declare const process: { env: Record<string, string | undefined> };

// 백엔드(FastAPI)에 CORS 설정이 없으므로, 개발 서버 프록시로 같은 출처처럼 호출한다.
// 브라우저 → http://localhost:5173/api/... → http://127.0.0.1:8080/...
// 다른 주소의 백엔드를 쓰려면 API_PROXY_TARGET 환경 변수로 지정한다.
const target = process.env.API_PROXY_TARGET ?? 'http://127.0.0.1:8080';

const proxy = {
  '/api': {
    target,
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api/, ''),
  },
};

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy },
  preview: { port: 4173, proxy },
});
