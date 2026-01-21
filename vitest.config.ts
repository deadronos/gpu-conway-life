import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['src/setupTests.ts'],
    globals: true,
    exclude: ['tests/e2e/**'],
    coverage: {
      reporter: ['text', 'lcov'],
    },
  },
})
