/**
 * check-scenarios-table.js
 * Path: backend/scripts/check-scenarios-table.js
 * Description: Check if scenarios table exists
 * Run: node scripts/check-scenarios-table.js
 */

import sequelize from "../config/db.js";

async function checkTable() {
  console.log("\n📊 ========================================");
  console.log("📊  Checking Scenarios Table");
  console.log("📊 ========================================\n");

  try {
    await sequelize.authenticate();
    console.log("✅ Connected to database\n");

    // بررسی وجود جدول scenarios
    const [result] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'scenarios'
      )
    `);

    console.log(`📊 Scenarios table exists: ${result[0].exists}`);

    if (result[0].exists) {
      // تعداد رکوردها
      const [countResult] = await sequelize.query(`
        SELECT COUNT(*) FROM scenarios
      `);
      console.log(`📊 Total scenarios: ${countResult[0].count}`);

      // ساختار جدول
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'scenarios'
        ORDER BY ordinal_position
      `);

      console.log("\n📋 Table structure:");
      columns.forEach((col) => {
        console.log(`   ${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log("\n⚠️ Scenarios table does not exist!");
      console.log("   Run: node scripts/sync-db.js to create it");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await sequelize.close();
    console.log("\n🔒 Database connection closed");
  }
}

checkTable();
