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
    "^@/(.*)$": "<rootDir>/$1",
    "^@config/(.*)$": "<rootDir>/config/$1",
    "^@models/(.*)$": "<rootDir>/models/$1",
    "^@services/(.*)$": "<rootDir>/services/$1",
    "^@controllers/(.*)$": "<rootDir>/controllers/$1",
    "^@repositories/(.*)$": "<rootDir>/repositories/$1",
    "^@middlewares/(.*)$": "<rootDir>/middlewares/$1",
    "^@utils/(.*)$": "<rootDir>/utils/$1",
    "^@validators/(.*)$": "<rootDir>/validators/$1",
    "^@errors/(.*)$": "<rootDir>/errors/$1",
  },
};
