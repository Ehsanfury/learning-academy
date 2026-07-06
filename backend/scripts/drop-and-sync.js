/**
 * drop-and-sync.js
 * Path: backend/scripts/drop-and-sync.js
 * Description: Drop and recreate scenario tables with correct schema
 * Run: node scripts/drop-and-sync.js
 */

import sequelize from "../config/db.js";
import { Scenario, ScenarioSession } from "../models/index.js";

async function dropAndSync() {
  console.log("\n🔄 ========================================");
  console.log("🔄  Drop and Sync Scenario Tables");
  console.log("🔄 ========================================\n");

  try {
    await sequelize.authenticate();
    console.log("✅ Connected to database\n");

    // حذف جدول‌های مرتبط با سناریو
    console.log("🗑️ Dropping scenario_sessions table...");
    await sequelize.query("DROP TABLE IF EXISTS scenario_sessions CASCADE");
    console.log("✅ scenario_sessions dropped");

    console.log("🗑️ Dropping scenarios table...");
    await sequelize.query("DROP TABLE IF EXISTS scenarios CASCADE");
    console.log("✅ scenarios dropped\n");

    // ایجاد مجدد با schema صحیح
    console.log("🔄 Recreating tables with correct schema...");
    await sequelize.sync({ alter: true });
    console.log("✅ Tables recreated successfully\n");

    // بررسی ساختار
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'scenarios'
      ORDER BY ordinal_position
    `);

    console.log("📋 Scenario table structure:");
    columns.forEach((col) => {
      console.log(`   ${col.column_name}: ${col.data_type}`);
    });

    console.log("\n✅ ========================================");
    console.log("✅  Tables ready for seeding!");
    console.log("✅ ========================================\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await sequelize.close();
    console.log("\n🔒 Database connection closed");
  }
}

dropAndSync();
