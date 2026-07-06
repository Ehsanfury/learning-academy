/**
 * LessonSeeder.js
 * Path: backend/seeders/LessonSeeder.js
 * Description: Seed lessons from content files into database
 * Version: 2.0 - Fully compatible with new lesson structure
 * Changes:
 * - ✅ Added support for pronunciationGuide
 * - ✅ Added support for greetings array
 * - ✅ Added support for dialogues array
 * - ✅ Added support for cultureNotes
 * - ✅ Added support for cheatSheet
 * - ✅ Enhanced vocabulary parsing
 * - ✅ Safe handling of all data types
 */

import { Lesson } from "../models/index.js";
import sequelize from "../config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_PATH = path.join(__dirname, "../../content/courses/A1/lessons");

/**
 * 🔧 Convert null/undefined to safe default value
 */
function sanitizeNull(value, defaultValue = "") {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  return value;
}

/**
 * Parse localized string or object
 * Handles both JSON objects and string representations
 */
function parseLocalized(value) {
  if (!value) return {};
  if (typeof value === "object" && !Array.isArray(value)) {
    // Remove null values from object
    const cleanObj = {};
    Object.keys(value).forEach((key) => {
      cleanObj[key] = sanitizeNull(value[key], "");
    });
    return cleanObj;
  }

  if (typeof value === "string" && value.startsWith("@{")) {
    const clean = value.replace(/^@\{|\}$/g, "");
    const parts = clean.split("; ");
    const result = {};
    parts.forEach((part) => {
      const [key, ...val] = part.split("=");
      if (key && val) {
        result[key.trim()] = sanitizeNull(val.join("=").trim(), "");
      }
    });
    return result;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return {
        fa: sanitizeNull(value, ""),
        en: sanitizeNull(value, ""),
        de: sanitizeNull(value, ""),
      };
    }
  }

  return { fa: String(value || ""), en: String(value || ""), de: String(value || "") };
}

/**
 * Safe number conversion - prevents NaN
 */
function safeNumber(value, defaultValue = 0) {
  if (value === null || value === undefined) return defaultValue;
  const num = typeof value === "string" ? parseInt(value) : value;
  return isNaN(num) ? defaultValue : num;
}

/**
 * Safe float conversion - prevents NaN
 */
function safeFloat(value, defaultValue = 0) {
  if (value === null || value === undefined) return defaultValue;
  const num = typeof value === "string" ? parseFloat(value) : value;
  return isNaN(num) ? defaultValue : num;
}

/**
 * Sanitize array - remove nulls and undefined
 */
function sanitizeArray(array) {
  if (!Array.isArray(array)) return [];
  return array.map((item) => {
    if (item === null || item === undefined) return "";
    if (typeof item === "object") {
      const clean = {};
      Object.keys(item).forEach((key) => {
        clean[key] = sanitizeNull(item[key], "");
      });
      return clean;
    }
    return item;
  });
}

/**
 * Build sections from content data
 * Enhanced to support all new content types
 */
function buildSections(data) {
  const sections = [];

  // 1. Introduction
  if (data.lessonIntroduction) {
    sections.push({
      id: "introduction",
      type: "introduction",
      title: parseLocalized(data.lessonIntroduction.title),
      content: parseLocalized(data.lessonIntroduction.content),
      imagePrompt: sanitizeNull(data.lessonIntroduction.imagePrompt, null),
    });
  }

  // 2. Pronunciation Guide
  if (data.pronunciationGuide) {
    sections.push({
      id: "pronunciation-guide",
      type: "pronunciation_guide",
      title: parseLocalized(
        data.pronunciationGuide.title || {
          fa: "راهنمای تلفظ",
          en: "Pronunciation Guide",
          de: "Ausspracheführer",
        }
      ),
      layers: parseLocalized(data.pronunciationGuide.layers),
      sounds: data.pronunciationGuide.sounds || [],
    });
  }

  // 3. Greetings
  if (data.greetings && data.greetings.items && Array.isArray(data.greetings.items)) {
    sections.push({
      id: "greetings",
      type: "greetings",
      title: { fa: "احوال‌پرسی‌ها", en: "Greetings", de: "Begrüßungen" },
      items: data.greetings.items.map((g) => ({
        id: sanitizeNull(g.id, `greet-${Math.random().toString(36).substr(2, 6)}`),
        german: sanitizeNull(g.german, ""),
        persian: sanitizeNull(g.persian, ""),
        ipa: sanitizeNull(g.ipa, ""),
        meaning: sanitizeNull(g.meaning, ""),
        time: sanitizeNull(g.time, ""),
        formality: sanitizeNull(g.formality, ""),
        usage: parseLocalized(g.usage),
        commonMistake: parseLocalized(g.commonMistake),
      })),
    });
  }

  // 4. Vocabulary
  if (data.vocabulary && Array.isArray(data.vocabulary) && data.vocabulary.length > 0) {
    sections.push({
      id: "vocabulary",
      type: "vocabulary",
      title: { fa: "واژگان", en: "Vocabulary", de: "Wortschatz" },
      items: data.vocabulary.map((v) => ({
        id: sanitizeNull(v.id, `voc-${Math.random().toString(36).substr(2, 6)}`),
        de: sanitizeNull(v.de, ""),
        fa: sanitizeNull(v.fa, ""),
        en: sanitizeNull(v.en, ""),
        ipa: sanitizeNull(v.ipa, ""),
        article: sanitizeNull(v.article, ""),
        plural: sanitizeNull(v.plural, ""),
        example: v.example || {},
        usageNotes: parseLocalized(v.usageNotes),
        commonMistakes: parseLocalized(v.commonMistakes),
        difficulty: safeNumber(v.difficulty, 1),
        frequency: safeNumber(v.frequency, 1),
      })),
    });
  }

  // 5. Grammar
  if (
    data.grammar &&
    data.grammar.topics &&
    Array.isArray(data.grammar.topics) &&
    data.grammar.topics.length > 0
  ) {
    sections.push({
      id: "grammar",
      type: "grammar",
      title: { fa: "گرامر", en: "Grammar", de: "Grammatik" },
      topics: data.grammar.topics.map((t) => ({
        id: sanitizeNull(t.id, `gram-${Math.random().toString(36).substr(2, 6)}`),
        title: parseLocalized(t.title),
        concept: parseLocalized(t.concept),
        rules: t.rules || {},
        conjugationTable: t.conjugationTable || null,
        pronounTable: t.pronounTable || null,
        structure: t.structure || null,
        examples: t.examples || [],
        pattern: parseLocalized(t.pattern),
        note: parseLocalized(t.note),
        duzen: t.duzen || null,
      })),
    });
  }

  // 6. Dialogues
  if (data.dialogues && Array.isArray(data.dialogues) && data.dialogues.length > 0) {
    sections.push({
      id: "dialogues",
      type: "dialogues",
      title: { fa: "دیالوگ‌ها", en: "Dialogues", de: "Dialoge" },
      items: data.dialogues.map((d) => ({
        id: sanitizeNull(d.id, `dialog-${Math.random().toString(36).substr(2, 6)}`),
        title: parseLocalized(d.title),
        characters: d.characters || [],
        lines: d.lines || [],
      })),
    });
  }

  // 7. Culture Notes
  if (data.cultureNotes) {
    sections.push({
      id: "culture-notes",
      type: "culture_notes",
      title: { fa: "نکات فرهنگی", en: "Cultural Notes", de: "Kulturelle Hinweise" },
      content: parseLocalized(data.cultureNotes),
    });
  }

  // 8. Exercises
  if (data.exercises) {
    sections.push({
      id: "exercises",
      type: "exercises",
      title: { fa: "تمرین‌ها", en: "Exercises", de: "Übungen" },
      data: data.exercises,
    });
  }

  // 9. Review
  if (data.review) {
    sections.push({
      id: "review",
      type: "review",
      title: { fa: "مرور", en: "Review", de: "Wiederholung" },
      titleObj: parseLocalized(data.review.title),
      quiz: data.review.quiz || [],
    });
  }

  // 10. Assessment
  if (data.assessment) {
    sections.push({
      id: "assessment",
      type: "assessment",
      title: { fa: "ارزیابی", en: "Assessment", de: "Bewertung" },
      titleObj: parseLocalized(data.assessment.title),
      totalQuestions: safeNumber(data.assessment.totalQuestions, 15),
      passingScore: safeNumber(data.assessment.passingScore, 70),
      sections: data.assessment.sections || {},
      selfEvaluation: parseLocalized(data.assessment.selfEvaluation),
      recommendations: data.assessment.recommendations || {},
    });
  }

  // 11. Cheat Sheet
  if (data.cheatSheet) {
    sections.push({
      id: "cheat-sheet",
      type: "cheat_sheet",
      title: { fa: "برگه خلاصه", en: "Cheat Sheet", de: "Spickzettel" },
      greetings: data.cheatSheet.greetings || [],
      pronouns: data.cheatSheet.pronouns || [],
      keyPhrases: data.cheatSheet.key_phrases || [],
      grammar: data.cheatSheet.grammar || [],
      duVsSie: data.cheatSheet.du_vs_sie || [],
    });
  }

  return sections;
}

/**
 * Count total questions in exercises
 */
function countQuestions(data) {
  let count = 0;
  if (data.exercises) {
    Object.values(data.exercises).forEach((exerciseArray) => {
      if (Array.isArray(exerciseArray)) {
        exerciseArray.forEach((exercise) => {
          if (exercise.questions) {
            count += exercise.questions.length;
          }
        });
      }
    });
  }
  if (data.assessment?.totalQuestions) {
    count += safeNumber(data.assessment.totalQuestions);
  }
  if (data.review?.quiz) {
    count += data.review.quiz.length;
  }
  return count;
}

/**
 * Count total vocabulary items
 */
function countVocabulary(data) {
  if (data.vocabulary && Array.isArray(data.vocabulary)) {
    return data.vocabulary.length;
  }
  return 0;
}

/**
 * Transform content JSON to database format
 */
function transformLessonData(content, fileId) {
  const id = content.id || fileId || `lesson-${Date.now()}`;

  return {
    id: id.toLowerCase(),
    level: sanitizeNull(content.level, "A1"),
    unit: safeNumber(content.unit, 1),
    lessonNumber: safeNumber(content.order || content.lessonNumber, 1),
    order: safeNumber(content.order, 1),
    version: sanitizeNull(content.version || content.metadata?.version, "2.0.0"),
    status: sanitizeNull(content.status || content.metadata?.status, "published"),
    lastUpdated: new Date().toISOString(),
    estimatedTime: safeNumber(content.estimatedMinutes || content.estimatedTime, 90),
    difficulty: safeNumber(content.difficulty || content.metadata?.difficulty, 1),
    prerequisites: content.requiredPreviousKnowledge
      ? parseLocalized(content.requiredPreviousKnowledge)
      : {},
    nextLessonId: sanitizeNull(content.nextLessonId, null),
    previousLessonId: sanitizeNull(content.previousLessonId, null),

    // Titles (JSONB)
    title: parseLocalized(content.title),
    shortTitle: parseLocalized(content.shortTitle || content.subtitle || content.title),
    description: parseLocalized(
      content.description || content.subtitle || content.lessonIntroduction?.content || ""
    ),
    learningObjectives: parseLocalized(content.learningObjectives),

    // XP
    xpReward: safeNumber(content.xpReward, 75),
    perfectBonusXP: safeNumber(content.perfectBonusXP, 30),
    completionBonusXP: safeNumber(content.completionBonusXP, 100),

    // CEFR
    cefr: sanitizeNull(content.cefr || content.level, "A1.1"),
    goetheChapter: sanitizeNull(content.goetheChapter || content.metadata?.goetheChapter, null),
    tags: content.metadata?.tags || content.tags || [],
    skills: ["reading", "writing", "listening", "speaking"],
    examRelevance: content.examRelevance || null,

    // ✅ MAIN CONTENT - Sections (JSONB)
    sections: buildSections(content),
    totalSections: buildSections(content).length,
    totalQuestions: countQuestions(content),
    totalVocabulary: countVocabulary(content),

    // Management
    isActive: true,
    exportable: true,
  };
}

/**
 * Seed lessons from JSON files
 */
export async function seedLessons() {
  console.log("\n📚 ========================================");
  console.log("📚  Seeding Lessons into Database");
  console.log("📚 ========================================\n");

  try {
    // Check if content directory exists
    if (!fs.existsSync(CONTENT_PATH)) {
      console.error(`❌ Content directory not found: ${CONTENT_PATH}`);
      return;
    }

    // Read all JSON files
    const files = fs.readdirSync(CONTENT_PATH).filter((f) => f.endsWith(".json"));

    if (files.length === 0) {
      console.error(`❌ No JSON files found in: ${CONTENT_PATH}`);
      return;
    }

    console.log(`📁 Found ${files.length} lesson files\n`);

    let created = 0;
    let updated = 0;
    let errors = 0;

    for (const file of files) {
      const filePath = path.join(CONTENT_PATH, file);

      try {
        // Read file with UTF-8 encoding
        const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const fileId = path.basename(file, ".json");

        // Transform content with safe number handling
        const lessonData = transformLessonData(content, fileId);

        // Check if lesson exists
        const existing = await Lesson.findByPk(lessonData.id);

        if (existing) {
          // Update existing
          await existing.update(lessonData);
          updated++;
          console.log(
            `  🔄 Updated: ${file} → ${lessonData.title?.fa || lessonData.title?.en || "بدون عنوان"} (${lessonData.totalSections} sections, ${lessonData.totalVocabulary} vocab)`
          );
        } else {
          // Create new
          await Lesson.create(lessonData);
          created++;
          console.log(
            `  ✅ Created: ${file} → ${lessonData.title?.fa || lessonData.title?.en || "بدون عنوان"} (${lessonData.totalSections} sections, ${lessonData.totalVocabulary} vocab)`
          );
        }
      } catch (error) {
        errors++;
        console.error(`  ❌ Error with ${file}:`, error.message);
        if (error.message.includes("NaN")) {
          console.error(`     💡 Check for NaN values in ${file}`);
        }
        if (error.message.includes("Unexpected token")) {
          console.error(`     💡 Check JSON syntax in ${file}`);
        }
      }
    }

    // Summary
    console.log("\n📊 ========================================");
    console.log("📊  Seeding Complete!");
    console.log("📊 ========================================");
    console.log(`   ✅ Created:  ${created} lessons`);
    console.log(`   🔄 Updated:  ${updated} lessons`);
    console.log(`   ❌ Errors:   ${errors} errors`);

    const finalCount = await Lesson.count();
    console.log(`\n📊 Total lessons in database: ${finalCount}`);

    // Show sample of first lesson
    const firstLesson = await Lesson.findOne({
      order: [["order", "ASC"]],
    });

    if (firstLesson) {
      console.log(`\n📖 Sample lesson:`);
      console.log(`   ID: ${firstLesson.id}`);
      console.log(`   Title: ${firstLesson.title?.fa || firstLesson.title?.en || "N/A"}`);
      console.log(`   Sections: ${firstLesson.totalSections}`);
      console.log(`   Vocabulary: ${firstLesson.totalVocabulary}`);
      console.log(`   Questions: ${firstLesson.totalQuestions}`);

      // Show section types
      if (firstLesson.sections && firstLesson.sections.length > 0) {
        const sectionTypes = firstLesson.sections.map((s) => s.type).join(", ");
        console.log(`   Section Types: ${sectionTypes}`);
      }
    }
  } catch (error) {
    console.error("\n❌ Fatal error:", error.message);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  await sequelize.authenticate();
  await seedLessons();
  process.exit(0);
}

export default seedLessons;
