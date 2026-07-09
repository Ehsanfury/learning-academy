/**
 * env.js
 * Path: backend/config/env.js
 * Description: Environment configuration with validation
 * Changes:
 * - ✅ FIXED: Separate JWT secrets for access and refresh
 * - ✅ FIXED: SESSION_SECRET now has its own validation
 * - ✅ FIXED: Added GOOGLE_GEMINI_API_KEY support
 * - ✅ FIXED: All variable names match .env file
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
  "JWT_REFRESH_SECRET",
  "JWT_ACCESS_EXPIRES_IN",
  "JWT_REFRESH_EXPIRES_IN",
  "SESSION_SECRET", // ✅ NEW: Required for production
];

// Check for missing required variables
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

// In production, all variables are required
if (process.env.NODE_ENV === "production" && missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(", ")}`);
  process.exit(1);
}

// In development, only warn about missing SESSION_SECRET
if (process.env.NODE_ENV === "development") {
  const devMissing = missingVars.filter((v) => v !== "SESSION_SECRET");
  if (devMissing.length > 0) {
    console.warn(`⚠️ Missing environment variables: ${devMissing.join(", ")}`);
  }
  if (missingVars.includes("SESSION_SECRET")) {
    console.warn("⚠️ SESSION_SECRET not set - using fallback (not recommended for production)");
  }
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
    // SSL configuration
    ssl: {
      enabled: process.env.DB_SSL === "true" || process.env.NODE_ENV === "production",
      rejectUnauthorized: process.env.DB_REJECT_UNAUTHORIZED === "true",
    },
  },

  // JWT - Separate secrets
  jwt: {
    secret: process.env.JWT_SECRET,
    accessSecret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },

  // ✅ FIXED: Session secret separate from JWT
  session: {
    secret:
      process.env.SESSION_SECRET ||
      (process.env.NODE_ENV === "production"
        ? null
        : "development-session-secret-do-not-use-in-production"),
    maxAge: parseInt(process.env.SESSION_MAX_AGE || "604800000", 10),
  },

  // Admin user
  admin: {
    email: process.env.ADMIN_EMAIL || "admin@german-academy.com",
    password: process.env.ADMIN_PASSWORD || "admin123456",
  },

  // AI Services
  ai: {
    openRouterApiKey: process.env.OPENROUTER_API_KEY,
    googleGeminiApiKey: process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY,
    defaultModel: process.env.DEFAULT_AI_MODEL || "gemini-2.0-flash",
    fallbackModel: process.env.FALLBACK_AI_MODEL || "openrouter/gpt-4o-mini",
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

// Validate JWT secrets
if (env.jwt.secret && env.jwt.secret.length < 32) {
  console.warn("⚠️ JWT_SECRET should be at least 32 characters long");
}

if (env.jwt.refreshSecret && env.jwt.refreshSecret.length < 32) {
  console.warn("⚠️ JWT_REFRESH_SECRET should be at least 32 characters long");
}

if (env.isProduction && env.jwt.accessSecret === env.jwt.refreshSecret) {
  console.warn("⚠️ JWT_SECRET and JWT_REFRESH_SECRET should be different in production");
}

// Validate session secret in production
if (env.isProduction && !env.session.secret) {
  console.error("❌ SESSION_SECRET is required in production!");
  process.exit(1);
}

export default env;
