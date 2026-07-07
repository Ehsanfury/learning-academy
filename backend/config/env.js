/**
 * env.js
 * Path: backend/config/env.js
 * Description: Environment configuration with validation
 * Changes:
 * - ✅ FIXED: Added GOOGLE_GEMINI_API_KEY support
 * - ✅ FIXED: Removed self-reference
 * - ✅ FIXED: Variable names match .env file
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from correct path (backend/.env)
dotenv.config({ path: path.join(__dirname, "../.env") });

// ============================================
// 📋 Required Environment Variables
// ============================================

const requiredEnvVars = [
  "NODE_ENV",
  "PORT",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "DB_HOST",
  "DB_PORT",
  "JWT_SECRET",
  "JWT_ACCESS_EXPIRES_IN",
  "JWT_REFRESH_EXPIRES_IN",
];

// Check for missing required variables
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(", ")}`);
  process.exit(1);
}

// ============================================
// 📊 Environment Configuration
// ============================================

export const env = {
  // Node environment
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
  isTest: process.env.NODE_ENV === "test",

  // Server
  port: parseInt(process.env.PORT || "5001", 10),
  host: process.env.HOST || "localhost",

  // Database
  db: {
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    dialect: "postgres",
    logging: process.env.DB_LOGGING === "true",
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    accessSecret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  // Admin user
  admin: {
    email: process.env.ADMIN_EMAIL || "admin@german-academy.com",
    password: process.env.ADMIN_PASSWORD || "admin123456",
  },

  // AI Services - ✅ ADDED Google Gemini
  ai: {
    openRouterApiKey: process.env.OPENROUTER_API_KEY,
    googleGeminiApiKey: process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY,
    defaultModel: process.env.DEFAULT_AI_MODEL || "gemini-pro",
    fallbackModel: process.env.FALLBACK_AI_MODEL || "openrouter/gpt-3.5-turbo",
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN?.split(",") || [
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    credentials: true,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || "info",
    format: process.env.LOG_FORMAT || "json",
  },

  // Email
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    secure: process.env.EMAIL_SECURE === "true",
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM,
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || "0", 10),
  },

  // Session
  session: {
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
    maxAge: parseInt(process.env.SESSION_MAX_AGE || "604800000", 10),
  },
};

// ============================================
// 🔍 Helper Functions
// ============================================

export const isAIConfigured = () => {
  return !!env.ai.openRouterApiKey || !!env.ai.googleGeminiApiKey;
};

export const isGeminiConfigured = () => {
  return !!env.ai.googleGeminiApiKey;
};

export const getAIProvider = () => {
  if (env.ai.googleGeminiApiKey) return "gemini";
  if (env.ai.openRouterApiKey) return "openrouter";
  return null;
};

// Validate JWT secret length
if (env.jwt.secret && env.jwt.secret.length < 32) {
  console.warn("⚠️ JWT_SECRET should be at least 32 characters long");
}

export default env;
