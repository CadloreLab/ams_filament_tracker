import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // <-- Ensures assets load relative to index.html without 404 errors
  build: {
    chunkSizeWarningLimit: 1000,
  }
});