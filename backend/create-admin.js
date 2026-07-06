/**
 * create-admin.js
 * Path: backend/create-admin.js
 * Description: Script to create admin user
 * Changes:
 * - ✅ Removed sensitive console.log (password, id)
 * - ✅ Added logger instead
 */

import { User } from "./models/index.js";
import sequelize from "./config/db.js";
import logger from "./config/logger.js";

async function createAdmin() {
  try {
    await sequelize.authenticate();
    logger.info("Database connected");

    const email = process.env.ADMIN_EMAIL || "admin@german-academy.com";
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      logger.error("ADMIN_PASSWORD is not set in .env");
      process.exit(1);
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      logger.info(`Admin already exists: ${existing.email}`);
      process.exit(0);
    }

    await User.create({
      name: "Admin",
      email,
      password: adminPassword,
      role: "admin",
      isActive: true,
      emailVerified: true,
    });

    logger.info("✅ Admin created successfully");
    // ❌ Password and ID are NOT logged
    process.exit(0);
  } catch (error) {
    logger.error("❌ Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();
