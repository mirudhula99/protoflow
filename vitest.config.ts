import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // jsdom gives the marker parser a real DOMParser to exercise.
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['src/test-setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
