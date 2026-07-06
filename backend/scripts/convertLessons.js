/**
 * convertLessons.js
 * Path: scripts/convertLessons.js
 * Description: Convert lesson content from old format to new format
 * Changes:
 * - M14: Removed duplicate key 'pronunciation'
 * - M15: Made script idempotent (checks if already converted)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// Configuration
// ============================================

const CONTENT_DIR = path.join(__dirname, "../content/courses");
const OUTPUT_DIR = path.join(__dirname, "../content/converted");

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ============================================
// Section Types (M14: Removed duplicate)
// ============================================

// ✅ M14: Single source of truth - no duplicates
const SECTION_TYPES = {
  INTRODUCTION: "introduction",
  VOCABULARY: "vocabulary",
  GRAMMAR: "grammar",
  PRONUNCIATION: "pronunciation", // Only defined once
  READING: "reading",
  LISTENING: "listening",
  SPEAKING: "speaking",
  WRITING: "writing",
  EXERCISES: "exercises",
  CHALLENGE: "challenge",
  REAL_LIFE: "real-life",
  SUMMARY: "summary",
  FLASHCARDS: "flashcards",
  QUIZ: "quiz",
  HOMEWORK: "homework",
  REVISION: "revision",
};

// ============================================
// Validation
// ============================================

const validateLesson = (lesson) => {
  const requiredFields = ["id", "level", "unit", "lessonNumber", "title", "sections"];
  const missing = requiredFields.filter((field) => !lesson[field]);

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }

  if (!Array.isArray(lesson.sections) || lesson.sections.length === 0) {
    throw new Error("Lesson must have at least one section");
  }

  return true;
};

/**
 * ✅ M15: Check if lesson already exists in converted format
 */
const isAlreadyConverted = (lessonId) => {
  const outputPath = path.join(OUTPUT_DIR, `${lessonId}.json`);
  return fs.existsSync(outputPath);
};

// ============================================
// Main conversion
// ============================================

const convertLesson = (lessonPath) => {
  try {
    // Read lesson file
    const rawData = fs.readFileSync(lessonPath, "utf8");
    const lesson = JSON.parse(rawData);

    // ✅ M15: Skip if already converted
    if (isAlreadyConverted(lesson.id)) {
      console.log(`⏭️ Lesson ${lesson.id} already converted, skipping...`);
      return;
    }

    // Validate lesson structure
    validateLesson(lesson);

    // Convert sections to new format
    const convertedSections = lesson.sections.map((section) => {
      // Ensure each section has an id
      if (!section.id) {
        section.id = `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }

      // Ensure each section has a type
      if (!section.type) {
        section.type = SECTION_TYPES.INTRODUCTION;
      }

      return section;
    });

    // Create converted lesson
    const convertedLesson = {
      ...lesson,
      sections: convertedSections,
      version: "2.0.0",
      convertedAt: new Date().toISOString(),
    };

    // Save converted lesson
    const outputPath = path.join(OUTPUT_DIR, `${lesson.id}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(convertedLesson, null, 2), "utf8");

    console.log(`✅ Converted lesson: ${lesson.id}`);
    return convertedLesson;
  } catch (error) {
    console.error(`❌ Error converting ${lessonPath}:`, error.message);
    return null;
  }
};

// ============================================
// Batch conversion
// ============================================

const convertAllLessons = () => {
  console.log("📚 Starting lesson conversion...");

  // Get all level directories
  const levels = fs.readdirSync(CONTENT_DIR);

  let convertedCount = 0;
  let skippedCount = 0;

  for (const level of levels) {
    const levelPath = path.join(CONTENT_DIR, level);
    const lessonsPath = path.join(levelPath, "lessons");

    if (!fs.existsSync(lessonsPath)) {
      continue;
    }

    const lessonFiles = fs.readdirSync(lessonsPath).filter((f) => f.endsWith(".json"));

    for (const file of lessonFiles) {
      const lessonPath = path.join(lessonsPath, file);
      const result = convertLesson(lessonPath);

      if (result) {
        convertedCount++;
      } else {
        skippedCount++;
      }
    }
  }

  console.log(`\n✅ Conversion complete!`);
  console.log(`   Converted: ${convertedCount}`);
  console.log(`   Skipped: ${skippedCount}`);
};

// ============================================
// Run if called directly
// ============================================

if (import.meta.url === `file://${process.argv[1]}`) {
  convertAllLessons();
}

export { convertLesson, convertAllLessons, validateLesson, SECTION_TYPES, isAlreadyConverted };
