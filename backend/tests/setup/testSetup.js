/**
 * testSetup.js
 * Path: backend/tests/setup/testSetup.js
 * Description: Test setup and teardown
 * Changes:
 * - ✅ FIXED: Proper database reset for all tests
 * - ✅ FIXED: Use beforeAll and afterAll correctly
 */

import { beforeAll, afterAll, afterEach } from "vitest";
import sequelize from "../../config/db.js";

// ✅ فقط یک بار قبل از همه تست‌ها اجرا می‌شود
beforeAll(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Test database connected");

    // ✅ حذف کامل با CASCADE
    await sequelize.drop({ cascade: true });
    console.log("✅ All tables dropped with CASCADE");

    // ✅ همگام‌سازی کامل
    await sequelize.sync({ force: true });
    console.log("✅ Test database synced with force: true");

    // ✅ نمایش جدول‌های ایجاد شده
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log("📊 Tables created:", tables.join(", "));
  } catch (error) {
    console.error("❌ Test database setup failed:", error.message);
    throw error;
  }
});

// بعد از هر تست
afterEach(async () => {
  // پاک کردن داده‌ها (می‌توان از transactions استفاده کرد)
});

// بعد از همه تست‌ها
afterAll(async () => {
  try {
    await sequelize.close();
    console.log("✅ Test database connection closed");
  } catch (error) {
    console.error("❌ Error closing test database:", error.message);
  }
});
