/**
 * runScenarioSeeder.js
 * Path: backend/scripts/runScenarioSeeder.js
 * Description: Run the scenario seeder
 */

import sequelize from "../config/db.js";
import seedScenarios from "../seeders/ScenarioSeeder.js";

async function run() {
  console.log("\n🚀 ========================================");
  console.log("🚀  Running Scenario Seeder");
  console.log("🚀 ========================================\n");

  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully\n");

    await sequelize.sync({ alter: true });
    console.log("✅ Models synced\n");

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
