import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/test/**/*.ts",
        "src/**/__mocks__/**/*.ts",
        "src/**/__fixtures__/**/*.ts",
        "src/test-helpers/**/*.ts",
        "src/**/__tests__/**/*.ts",
        "src/content/config.ts",
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
    // Tests post-build pour sites statiques
    testTimeout: process.env.CI ? 10000 : 5000,
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
});
