interface ImportMetaEnv {
  VITE_API_BASE_URL: string;
  VITE_AUTH_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
