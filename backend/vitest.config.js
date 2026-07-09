import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup/testSetup.js"],
    // ✅ مهم: اجرای تست‌ها به صورت سری (برای جلوگیری از تداخل)
    fileParallelism: false,
    // ✅ اجرای یک فایل تست در یک زمان
    maxConcurrency: 1,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/**",
        "tests/**",
        "**/*.config.js",
        "**/index.js",
        "**/server.js",
        "**/seeders/**",
        "**/scripts/**",
      ],
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
});
