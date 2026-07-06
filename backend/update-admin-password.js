/**
 * update-admin-password.js
 * Path: backend/update-admin-password.js
 * Description: Script to update admin password
 * Changes:
 * - ✅ Removed all sensitive console.log
 * - ✅ Added logger
 */

import { User } from "./models/index.js";
import sequelize from "./config/db.js";
import logger from "./config/logger.js";

async function updateAdminPassword() {
  try {
    await sequelize.authenticate();
    logger.info("Database connected");

    const email = process.env.ADMIN_EMAIL || "admin@german-academy.com";
    const newPassword = process.env.ADMIN_PASSWORD;

    if (!newPassword) {
      logger.error("ADMIN_PASSWORD is not set in .env");
      process.exit(1);
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      logger.error("Admin user not found");
      process.exit(1);
    }

    user.password = newPassword;
    await user.save();

    logger.info("✅ Password updated successfully");
    // ❌ Password hash is NOT logged
    process.exit(0);
  } catch (error) {
    logger.error("❌ Error updating password:", error);
    process.exit(1);
  }
}

updateAdminPassword();
