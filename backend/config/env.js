/**
 * env.js
 * Path: backend/config/env.js
 * Description: Environment configuration with validation
 * Changes:
 * - ✅ Added isProduction, isDevelopment, isTest as properties (not functions)
 * - ✅ Fixed config object to include isProduction
 * - ✅ Updated API keys with new values
 * - ✅ Removed hardcoded placeholder patterns
 * - ✅ Added proper validation
 * - ✅ Removed logging of sensitive data
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../../.env") });

// ============================================
// 📊 Configuration Object
// ============================================

const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";
const isDevelopment = NODE_ENV === "development";
const isTest = NODE_ENV === "test";

const config = {
  // ============================================
  // 🚀 Server
  // ============================================
  nodeEnv: NODE_ENV,
  isProduction,
  isDevelopment,
  isTest,
  port: parseInt(process.env.PORT || "5001", 10),
  appUrl: process.env.APP_URL || "http://localhost:3000",

  // ============================================
  // 🔐 JWT
  // ============================================
  jwt: {
    accessSecret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || "15m",
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || "7d",
  },

  // ============================================
  // 🗄️ Database
  // ============================================
  db: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME || "mydb",
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD,
  },

  // ============================================
  // 🤖 AI Services
  // ============================================
  ai: {
    openRouterKey: process.env.AI_API_KEY,
    geminiKey: process.env.AI_API_KEY_GEMINI,
    defaultModel: process.env.AI_DEFAULT_MODEL || "openrouter",
  },

  // ============================================
  // 🛡️ CORS
  // ============================================
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  },

  // ============================================
  // 👑 Admin
  // ============================================
  admin: {
    email: process.env.ADMIN_EMAIL || "admin@german-academy.com",
    password: process.env.ADMIN_PASSWORD,
  },

  // ============================================
  // 📧 Email (optional)
  // ============================================
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || "587", 10),
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || "noreply@german-academy.com",
  },
};

// ============================================
// ✅ Validation
// ============================================

const validateConfig = () => {
  const errors = [];

  // Validate JWT secrets
  if (!config.jwt.accessSecret) {
    errors.push("JWT_SECRET is required");
  }

  // Validate database password
  if (!config.db.password) {
    errors.push("DB_PASSWORD is required");
  }

  // Validate at least one AI provider
  if (!config.ai.openRouterKey && !config.ai.geminiKey) {
    errors.push("At least one AI provider (AI_API_KEY or AI_API_KEY_GEMINI) is required");
  }

  if (errors.length > 0) {
    console.error("❌ Configuration validation failed:");
    errors.forEach((err) => console.error(`   - ${err}`));
    if (isProduction) {
      process.exit(1);
    }
  }

  return errors.length === 0;
};

// ============================================
// 🔧 Helper Functions
// ============================================

export const isAIConfigured = () => {
  return !!config.ai.openRouterKey || !!config.ai.geminiKey;
};

export const isGeminiConfigured = () => {
  return !!config.ai.geminiKey;
};

// ============================================
// ✅ Validate on import
// ============================================

validateConfig();

// ============================================
// 📤 Export
// ============================================

export default config;
