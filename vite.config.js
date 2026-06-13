import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';

export default defineConfig({
  plugins: [
    react(),
    babel({
      presets: [reactCompilerPreset()]
    })
  ],

  // Base path for deployment
  base: '/teamCore/',

  // Development server proxy
  server: {
    proxy: {
      '/login': {
        target: 'https://teamcorebackend-production.up.railway.app',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'https://teamcorebackend-production.up.railway.app',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});