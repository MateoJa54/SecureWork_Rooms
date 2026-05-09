import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true,
    },
  },

  test: {
    globals: true,

    environment: 'jsdom',

    setupFiles: ['./src/tests/setup.js'],

    coverage: {
      provider: 'v8',

      reporter: ['text', 'html'],

      reportsDirectory: './coverage',

      exclude: [
        'node_modules/',
        'src/tests/',
        'dist/',
      ],
    },
  },
});