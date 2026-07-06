/**
 * load-single-lesson.js
 * Path: backend/scripts/load-single-lesson.js
 * Description: Load a single lesson for testing
 * Changes:
 * - ✅ Fixed: Lesson.create is now active
 * - ✅ Added proper error handling
 */

import { Lesson } from "../models/index.js";
import sequelize from "../config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import logger from "../config/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LESSON_PATH = path.join(__dirname, "../../content/courses/A1/lessons/a1-l01.json");

async function loadSingleLesson() {
  try {
    await sequelize.authenticate();
    logger.info("✅ Database connected");

    const content = JSON.parse(fs.readFileSync(LESSON_PATH, "utf8"));

    const lessonData = {
      id: content.id,
      level: content.level || "A1",
      unit: content.unit || 1,
      lessonNumber: content.order || 1,
      title: content.title || { fa: "درس تست", en: "Test Lesson", de: "Test Lektion" },
      description: content.subtitle || null,
      learningObjectives: content.learningObjectives || null,
      xpReward: content.xpReward || 50,
      perfectBonusXP: content.perfectBonusXP || 25,
      estimatedTime: content.estimatedMinutes || 20,
      sections: content.sections || [],
      totalSections: content.sections?.length || 0,
      isActive: true,
    };

    // ✅ FIXED: Create lesson (was commented out)
    const lesson = await Lesson.create(lessonData);
    logger.info(`✅ Lesson created: ${lesson.id}`);

    process.exit(0);
  } catch (error) {
    logger.error("❌ Error:", error);
    process.exit(1);
  }
}

loadSingleLesson();
