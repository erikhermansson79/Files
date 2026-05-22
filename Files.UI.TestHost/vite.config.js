import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { env } from 'process';

const target = env.API_URL
  ?? (env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` : undefined)
  ?? (env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : undefined);

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['.localhost'],
    proxy: {
      '^/api': {
        target,
        secure: false,
        changeOrigin: true,
      },
    },
  },
  resolve: {
    dedupe: ['react', 'react-dom']
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
});
