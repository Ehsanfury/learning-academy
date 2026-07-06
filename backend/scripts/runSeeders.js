/**
 * runSeeders.js
 * Path: scripts/runSeeders.js
 * Description: Run database seeders
 * Changes:
 * - M16: Consolidated with loadLessonContent logic
 * - Single source of truth for seeding
 */

import sequelize from "../config/db.js";
import { logInfo, logError } from "../config/logger.js";
import Achievement from "../models/Achievement.js";
import { loadAllLessons } from "./loadLessonContent.js";

/**
 * Seed all default data
 */
const runSeeders = async () => {
  try {
    logInfo("🌱 Running database seeders...");

    // 1. Seed achievements
    const achievementCount = await Achievement.count();
    if (achievementCount === 0) {
      await Achievement.seedDefaults();
      logInfo("✅ Achievements seeded");
    } else {
      logInfo("ℹ️ Achievements already exist, skipping...");
    }

    // 2. Load lessons from content files
    await loadAllLessons();

    logInfo("✅ All seeders completed successfully");
  } catch (error) {
    logError("❌ Error running seeders:", error);
    throw error;
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeeders()
    .then(() => {
      console.log("✅ Seeders completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeders failed:", error);
      process.exit(1);
    });
}

export { runSeeders };
