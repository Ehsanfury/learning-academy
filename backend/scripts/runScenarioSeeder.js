/**
 * runScenarioSeeder.js
 * Path: backend/scripts/runScenarioSeeder.js
 * Description: Run the scenario seeder
 * Changes:
 * - ✅ FIXED: Removed sequelize.sync() - use migrations instead
 * - ✅ FIXED: Better error handling
 */

import sequelize from "../config/db.js";

async function run() {
  console.log("\n🚀 ========================================");
  console.log("🚀  Running Scenario Seeder");
  console.log("🚀 ========================================\n");

  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully\n");

    // ✅ FIXED: Don't use sync with alter - use migrations instead
    console.log("ℹ️  Using existing database schema (run migrations first)");

    // Import seeder dynamically
    const { default: seedScenarios } = await import("../seeders/ScenarioSeeder.js");
    await seedScenarios();

    console.log("\n✅ ========================================");
    console.log("✅  Seeder completed successfully!");
    console.log("✅ ========================================\n");
  } catch (error) {
    console.error("\n❌ ========================================");
    console.error("❌  Seeder failed!");
    console.error("❌ ========================================");
    console.error("❌ Error:", error.message);
    console.error("\n📋 Stack trace:");
    console.error(error.stack);
  } finally {
    await sequelize.close();
    console.log("\n🔒 Database connection closed");
  }
}

run();
