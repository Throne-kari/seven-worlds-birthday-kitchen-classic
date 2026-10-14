import { defineConfig } from 'vite';
export default defineConfig({
  base: process.env.PAGES_BASE_PATH || './',
  build: { target: 'es2022', sourcemap: false },
  server: { host: '127.0.0.1', port: 5176, strictPort: true },
  preview: { host: '127.0.0.1', port: 4187, strictPort: true },
});
