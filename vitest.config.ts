import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx'],
    },
    globals: true,
    testTimeout: 40000,
    projects: [
      {
        extends: true,
        test: {
          name: 'dom',
          environment: 'jsdom',
          setupFiles: './tests/setup.ts',
          include: ['tests/**/*.test.{ts,tsx}'],
          exclude: ['tests/backend.test.ts'],
        }
      },
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: ['tests/backend.test.ts'],
        }
      }
    ]
  },
});
