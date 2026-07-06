/**
 * runStreakChecker.js
 * Path: scripts/runStreakChecker.js
 * Description: Run streak checker for cron job
 *
 * Usage: npm run streak:check
 * Or: node scripts/runStreakChecker.js
 */

import streakService from "../services/streakService.js";
import { logInfo, logError } from "../config/logger.js";

const runStreakChecker = async () => {
  try {
    console.log("🔥 Running streak checker...");
    const results = await streakService.autoCheckAllStreaks();
    console.log(`✅ Streak checker completed. Reset ${results.length} users.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Streak checker failed:", error);
    process.exit(1);
  }
};

runStreakChecker();
