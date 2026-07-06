/**
 * setup.js
 * Path: backend/tests/setup.js
 * Description: Test setup and configuration
 */

import dotenv from "dotenv";
import { jest } from "@jest/globals";

// Load test environment
dotenv.config({ path: ".env.test" });

// Increase timeout for async tests
jest.setTimeout(30000);

// Global test setup
beforeAll(async () => {
  console.log("🧪 Starting tests...");
});

// Global test teardown
afterAll(async () => {
  console.log("✅ Tests completed");
});

// Mock console methods to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
