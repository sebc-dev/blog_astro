/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config'

export default getViteConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov", "json"],
      include: ["src/**/*.{ts,tsx,astro}"],
      exclude: [
        "src/test/**/*.ts",
        "src/**/__mocks__/**/*.ts",
        "src/**/__fixtures__/**/*.ts",
        "src/test-helpers/**/*.ts",
        "src/**/__tests__/**/*.ts",
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    testTimeout: process.env.CI ? 10000 : 5000,
  }
});