/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API 기본 경로. 기본값 '/api' (vite 프록시 → FastAPI) */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
