import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
import { env } from 'process';

const target = env.API_URL
    ?? (env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` : undefined)
    ?? (env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : undefined);

export default defineConfig({
    plugins: [
        react(),
        babel({ presets: [reactCompilerPreset()] })
    ],
    server: {
        allowedHosts: ['.localhost'],
        proxy: {
            '^/api': {
                target,
                secure: false,
                changeOrigin: true
            },
        }
    }
})
