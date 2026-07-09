/**
 * db.js
 * Path: backend/config/db.js
 * Description: Database configuration
 * Changes:
 * - ✅ FIXED: SSL configuration with rejectUnauthorized in production
 * - ✅ FIXED: Correct property names (name, user instead of database, username)
 * - ✅ Disabled logging in production
 * - ✅ Uses config from env.js
 */

import { Sequelize } from "sequelize";
import config from "./env.js";
import logger from "./logger.js";

// ============================================
// 📊 Database Configuration
// ============================================

const dbConfig = {
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  username: config.db.user,
  password: config.db.password,
  dialect: "postgres",
  dialectOptions: {},
  pool: {
    max: 20,
    min: 2,
    acquire: 60000,
    idle: 10000,
  },
  logging: config.isProduction ? false : (msg) => logger.debug(msg),
  retry: {
    max: 3,
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
    ],
  },
};

// ✅ FIXED: SSL configuration for production
if (config.db.ssl?.enabled) {
  dbConfig.dialectOptions.ssl = {
    require: true,
    rejectUnauthorized: config.db.ssl?.rejectUnauthorized !== false, // Default: true for production
  };
}

// Also handle the case where ssl is enabled but not in config.db.ssl
if (config.isProduction && !config.db.ssl?.enabled) {
  // In production, default to SSL with strict validation
  dbConfig.dialectOptions.ssl = {
    require: true,
    rejectUnauthorized: true,
  };
  logger.info("🔒 SSL enabled for production database connection (strict mode)");
}

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);

export const testConnection = async (retries = 3, delay = 1000) => {
  let attempt = 0;

  while (attempt < retries) {
    try {
      await sequelize.authenticate();
      logger.info(`✅ Database connection established (attempt ${attempt + 1})`);
      return true;
    } catch (error) {
      attempt++;
      logger.error(`❌ Database connection failed (attempt ${attempt}/${retries}):`, error.message);

      if (attempt < retries) {
        logger.info(`⏳ Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  }

  logger.error(`❌ Database connection failed after ${retries} attempts`);
  return false;
};

export default sequelize;
