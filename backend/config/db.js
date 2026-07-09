/**
 * db.js
 * Path: backend/config/db.js
 * Description: Database configuration
 * Changes:
 * - ✅ FIXED: Added test database support
 * - ✅ FIXED: Proper property names (name, user instead of database, username)
 * - ✅ FIXED: NODE_ENV=test uses mydb_test
 */

import { Sequelize } from "sequelize";
import config from "./env.js";
import logger from "./logger.js";

// ============================================
// 📊 Database Configuration
// ============================================

// ✅ برای تست، از دیتابیس جداگانه استفاده کنید
const getDatabaseName = () => {
  // اگر در محیط تست هستیم، از دیتابیس تست استفاده کن
  if (process.env.NODE_ENV === "test") {
    const testDbName = config.db.name + "_test";
    logger.info(`🧪 Using test database: ${testDbName}`);
    return testDbName;
  }
  return config.db.name;
};

// SSL configuration
const sslConfig = config.db.ssl || {};
const isSSLEnabled = sslConfig.enabled || process.env.NODE_ENV === "production";

const dbConfig = {
  host: config.db.host,
  port: config.db.port,
  database: getDatabaseName(),
  username: config.db.user,
  password: config.db.password,
  dialect: "postgres",
  dialectOptions: isSSLEnabled
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: sslConfig.rejectUnauthorized !== false,
        },
      }
    : {},
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
