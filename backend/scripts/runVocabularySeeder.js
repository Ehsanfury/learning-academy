/**
 * runVocabularySeeder.js
 * Path: backend/scripts/runVocabularySeeder.js
 * Description: Run the vocabulary seeder
 */

import sequelize from "../config/db.js";
import seedVocabulary from "../seeders/VocabularySeeder.js";

async function run() {
  console.log("\n🚀 ========================================");
  console.log("🚀  Running Vocabulary Seeder");
  console.log("🚀 ========================================\n");

  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully\n");

    await sequelize.sync({ alter: true });
    console.log("✅ Models synced\n");

    await seedVocabulary();

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
