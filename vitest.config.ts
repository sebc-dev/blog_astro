import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/test/**/*.ts",
        "src/**/__mocks__/**/*.ts",
        "src/**/__fixtures__/**/*.ts",
        "src/test-helpers/**/*.ts",
        "src/**/__tests__/**/*.ts",
        "src/test/setup.ts", // déjà référencé mais exécuté
      ],
    },
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
});
