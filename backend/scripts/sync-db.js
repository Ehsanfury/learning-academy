/**
 * sync-db.js
 * Path: backend/scripts/sync-db.js
 * Description: Sync database and create missing tables
 * Run: node scripts/sync-db.js
 */

import sequelize from "../config/db.js";
import { Scenario, ScenarioSession } from "../models/index.js";

async function syncDB() {
  console.log("\n🔄 ========================================");
  console.log("🔄  Syncing Database");
  console.log("🔄 ========================================\n");

  try {
    await sequelize.authenticate();
    console.log("✅ Connected to database\n");

    // ✅ Sync with alter: true (creates missing tables)
    await sequelize.sync({ alter: true });
    console.log("✅ Database synced successfully\n");

    // بررسی جدول scenarios
    const [result] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'scenarios'
      )
    `);

    console.log(`📊 Scenarios table exists: ${result[0].exists}`);

    if (result[0].exists) {
      const count = await Scenario.count();
      console.log(`📊 Total scenarios: ${count}`);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    await sequelize.close();
    console.log("\n🔒 Database connection closed");
  }
}

syncDB();
