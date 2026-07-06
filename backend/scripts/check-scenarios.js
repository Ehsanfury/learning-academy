/**
 * check-scenarios.js
 * Path: backend/scripts/check-scenarios.js
 * Description: Check scenarios in database
 * Run: node scripts/check-scenarios.js
 */

import sequelize from "../config/db.js";

async function checkScenarios() {
  console.log("\n📚 ========================================");
  console.log("📚  Checking Scenarios in Database");
  console.log("📚 ========================================\n");

  try {
    await sequelize.authenticate();
    console.log("✅ Connected to database\n");

    // 1. تعداد سناریوها
    const [countResult] = await sequelize.query("SELECT COUNT(*) FROM scenarios");
    console.log(`📊 Total scenarios in DB: ${countResult[0].count}\n`);

    // 2. لیست سناریوها
    const [scenarios] = await sequelize.query(`
      SELECT id, title, level, is_active 
      FROM scenarios 
      LIMIT 20
    `);

    if (scenarios.length === 0) {
      console.log("⚠️ No scenarios found in database!");
      console.log("   Run: node scripts/seed-scenarios.js\n");
    } else {
      console.log("📖 Scenarios:");
      scenarios.forEach((s) => {
        let title = s.id;
        if (typeof s.title === "object" && s.title !== null) {
          title = s.title.fa || s.id;
        } else if (typeof s.title === "string") {
          try {
            const parsed = JSON.parse(s.title);
            title = parsed.fa || s.id;
          } catch {
            title = s.id;
          }
        }
        const status = s.is_active ? "✅" : "❌";
        console.log(`  ${status} ${s.id}: ${title} (${s.level})`);
      });
    }

    console.log("\n✅ ========================================");
    console.log("✅  Check completed!");
    console.log("✅ ========================================\n");
  } catch (error) {
    console.error("\n❌ ========================================");
    console.error("❌  Check failed!");
    console.error("❌ ========================================");
    console.error("❌ Error:", error.message);
  } finally {
    await sequelize.close();
    console.log("\n🔒 Database connection closed");
  }
}

checkScenarios();
