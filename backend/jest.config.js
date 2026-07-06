/**
 * jest.config.js
 * Path: backend/jest.config.js
 * Description: Jest configuration for backend testing
 */

export default {
// TODO: Translate - TODO: Translate - // استفاده از ES Modules
  transform: {},
  extensionsToTreatAsEsm: [".js"],

// TODO: Translate - TODO: Translate - // محیط تست
  testEnvironment: "node",

// TODO: Translate - TODO: Translate - // پوشه‌های تست
  roots: ["<rootDir>/tests"],

// TODO: Translate - TODO: Translate - // الگوی فایل‌های تست
  testMatch: ["**/tests/**/*.test.js", "**/tests/**/*.spec.js"],

// TODO: Translate - TODO: Translate - // پوشه‌های نادیده گرفته شده
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/coverage/"],

// TODO: Translate - TODO: Translate - // گزارش Coverage
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/**/*.test.js",
    "!src/**/*.spec.js",
    "!src/server.js",
    "!src/app.js",
  ],

  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Setup files
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],

  // Mock static files
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@models/(.*)$": "<rootDir>/src/models/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@controllers/(.*)$": "<rootDir>/src/controllers/$1",
    "^@repositories/(.*)$": "<rootDir>/src/repositories/$1",
    "^@middlewares/(.*)$": "<rootDir>/src/middlewares/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@validators/(.*)$": "<rootDir>/src/validators/$1",
    "^@errors/(.*)$": "<rootDir>/src/errors/$1",
  },
};
