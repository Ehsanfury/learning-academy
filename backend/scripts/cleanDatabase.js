/**
 * cleanDatabase.js
 * Path: scripts/cleanDatabase.js
 * Description: Clean database utility
 * Changes:
 * - M24: Fixed production check to prevent accidental deletion
 */

import sequelize from "../config/db.js";
import { logInfo, logError } from "../config/logger.js";

const cleanDatabase = async () => {
  try {
    // ✅ M24: Only allow in development environment
    if (process.env.NODE_ENV === "production") {
      console.error("❌ Cannot clean database in production environment!");
      process.exit(1);
    }

    console.log("🧹 Starting database cleanup...");
    console.log("⚠️ This will delete ALL data!");
    console.log("Press Ctrl+C to cancel, or wait 5 seconds to continue...");

    // Wait 5 seconds for user to cancel
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Sync with force: true (drops all tables)
    await sequelize.sync({ force: true });

    console.log("✅ Database cleaned successfully!");
    process.exit(0);
  } catch (error) {
    logError("❌ Error cleaning database:", error);
    process.exit(1);
  }
};

cleanDatabase();
