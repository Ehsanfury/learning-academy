/**
 * loadLessonContent.js
 * Path: backend/scripts/loadLessonContent.js
 * Description: Load lesson content from JSON files into database
 * Changes:
 * - ✅ FIXED: Now properly reads all sections from content
 * - ✅ FIXED: Calculates totalSections and totalQuestions correctly
 */

import sequelize from "../config/db.js";
import { Lesson } from "../models/index.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_PATH = path.join(__dirname, "../../content/courses/A1/lessons");

/**
 * Count total questions in a lesson
 */
function countTotalQuestions(content) {
  let count = 0;

  // Check exercises
  if (content.exercises) {
    Object.values(content.exercises).forEach((exerciseArray) => {
      if (Array.isArray(exerciseArray)) {
        exerciseArray.forEach((exercise) => {
          if (exercise.questions && Array.isArray(exercise.questions)) {
            count += exercise.questions.length;
          }
        });
      }
    });
  }

  // Check review quiz
  if (content.review && content.review.quiz) {
    count += content.review.quiz.length;
  }

  // Check assessment
  if (content.assessment && content.assessment.totalQuestions) {
    count += content.assessment.totalQuestions;
  }

  return count;
}

/**
 * Build sections from content
 */
function buildSections(content) {
  const sections = [];

  // 1. Introduction
  if (content.lessonIntroduction) {
    sections.push({
      id: "introduction",
      type: "introduction",
      title: content.lessonIntroduction.title || {},
      content: content.lessonIntroduction.content || {},
      imagePrompt: content.lessonIntroduction.imagePrompt || null,
    });
  }

  // 2. Pronunciation Guide
  if (content.pronunciationGuide) {
    sections.push({
      id: "pronunciation-guide",
      type: "pronunciation_guide",
      title: content.pronunciationGuide.title || {},
      layers: content.pronunciationGuide.layers || {},
      sounds: content.pronunciationGuide.sounds || [],
    });
  }

  // 3. Greetings
  if (content.greetings && content.greetings.items) {
    sections.push({
      id: "greetings",
      type: "greetings",
      title: { fa: "احوال‌پرسی‌ها", en: "Greetings", de: "Begrüßungen" },
      items: content.greetings.items || [],
    });
  }

  // 4. Vocabulary
  if (content.vocabulary && content.vocabulary.length > 0) {
    sections.push({
      id: "vocabulary",
      type: "vocabulary",
      title: { fa: "واژگان", en: "Vocabulary", de: "Wortschatz" },
      items: content.vocabulary || [],
    });
  }

  // 5. Grammar
  if (content.grammar && content.grammar.topics) {
    sections.push({
      id: "grammar",
      type: "grammar",
      title: { fa: "گرامر", en: "Grammar", de: "Grammatik" },
      topics: content.grammar.topics || [],
    });
  }

  // 6. Dialogues
  if (content.dialogues && content.dialogues.length > 0) {
    sections.push({
      id: "dialogues",
      type: "dialogues",
      title: { fa: "دیالوگ‌ها", en: "Dialogues", de: "Dialoge" },
      items: content.dialogues || [],
    });
  }

  // 7. Culture Notes
  if (content.cultureNotes) {
    sections.push({
      id: "culture-notes",
      type: "culture_notes",
      title: { fa: "نکات فرهنگی", en: "Cultural Notes", de: "Kulturelle Hinweise" },
      content: content.cultureNotes || {},
    });
  }

  // 8. Exercises
  if (content.exercises) {
    sections.push({
      id: "exercises",
      type: "exercises",
      title: { fa: "تمرین‌ها", en: "Exercises", de: "Übungen" },
      data: content.exercises || {},
    });
  }

  // 9. Review
  if (content.review) {
    sections.push({
      id: "review",
      type: "review",
      title: { fa: "مرور", en: "Review", de: "Wiederholung" },
      titleObj: content.review.title || {},
      quiz: content.review.quiz || [],
    });
  }

  // 10. Assessment
  if (content.assessment) {
    sections.push({
      id: "assessment",
      type: "assessment",
      title: { fa: "ارزیابی", en: "Assessment", de: "Bewertung" },
      titleObj: content.assessment.title || {},
      totalQuestions: content.assessment.totalQuestions || 15,
      passingScore: content.assessment.passingScore || 70,
      sections: content.assessment.sections || {},
      selfEvaluation: content.assessment.selfEvaluation || {},
    });
  }

  // 11. Cheat Sheet
  if (content.cheatSheet) {
    sections.push({
      id: "cheat-sheet",
      type: "cheat_sheet",
      title: { fa: "برگه خلاصه", en: "Cheat Sheet", de: "Spickzettel" },
      greetings: content.cheatSheet.greetings || [],
      pronouns: content.cheatSheet.pronouns || [],
      keyPhrases: content.cheatSheet.keyPhrases || [],
      grammar: content.cheatSheet.grammar || [],
      duVsSie: content.cheatSheet.duVsSie || [],
    });
  }

  return sections;
}

/**
 * Load a single lesson from JSON file
 */
async function loadLesson(filePath) {
  try {
    const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const sections = buildSections(content);
    const totalQuestions = countTotalQuestions(content);
    const totalVocabulary = content.vocabulary?.length || 0;

    const lessonData = {
      id: content.id || path.basename(filePath, ".json"),
      level: content.level || "A1",
      unit: content.unit || 1,
      lessonNumber: content.order || 1,
      order: content.order || 1,
      version: content.version || content.metadata?.version || "2.0.0",
      status: content.status || content.metadata?.status || "published",
      lastUpdated: new Date().toISOString(),
      estimatedTime: content.estimatedMinutes || 60,
      difficulty: content.metadata?.difficulty || 1,
      prerequisites: content.requiredPreviousKnowledge || {},
      nextLessonId: content.nextLessonId || null,
      previousLessonId: content.previousLessonId || null,
      title: content.title || {},
      shortTitle: content.subtitle || content.title || {},
      description: content.description || content.subtitle || {},
      learningObjectives: content.learningObjectives || {},
      xpReward: content.xpReward || 50,
      perfectBonusXP: content.perfectBonusXP || 25,
      completionBonusXP: content.completionBonusXP || 75,
      cefr: content.level || "A1.1",
      goetheChapter: content.metadata?.goetheChapter || null,
      tags: content.metadata?.tags || [],
      skills: ["reading", "writing", "listening", "speaking"],
      examRelevance: content.examRelevance || null,

      // ✅ FIXED: sections now properly built
      sections: sections,
      totalSections: sections.length,
      totalQuestions: totalQuestions,
      totalVocabulary: totalVocabulary,

      isActive: true,
      exportable: true,
    };

    // Update or create
    const [lesson, created] = await Lesson.upsert(lessonData, {
      returning: true,
    });

    return {
      success: true,
      created,
      lesson,
      stats: {
        sections: sections.length,
        questions: totalQuestions,
        vocabulary: totalVocabulary,
      },
    };
  } catch (error) {
    console.error(`❌ Error loading ${filePath}:`, error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Load all lessons from content directory
 */
async function loadAllLessons() {
  console.log("\n📚 ========================================");
  console.log("📚  Loading Lesson Content");
  console.log("📚 ========================================\n");

  try {
    if (!fs.existsSync(CONTENT_PATH)) {
      console.error(`❌ Content directory not found: ${CONTENT_PATH}`);
      return;
    }

    const files = fs.readdirSync(CONTENT_PATH).filter((f) => f.endsWith(".json"));

    if (files.length === 0) {
      console.error(`❌ No JSON files found in: ${CONTENT_PATH}`);
      return;
    }

    console.log(`📁 Found ${files.length} lesson files\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const file of files) {
      const filePath = path.join(CONTENT_PATH, file);
      const result = await loadLesson(filePath);

      if (result.success) {
        successCount++;
        const status = result.created ? "✅ Created" : "🔄 Updated";
        console.log(
          `  ${status}: ${file} → ${result.lesson.title?.fa || "بدون عنوان"} ` +
            `(${result.stats.sections} sections, ${result.stats.questions} questions, ${result.stats.vocabulary} vocab)`
        );
      } else {
        errorCount++;
        console.error(`  ❌ Error: ${file} - ${result.error}`);
      }
    }

    console.log("\n📊 ========================================");
    console.log("📊  Loading Complete!");
    console.log("📊 ========================================");
    console.log(`   ✅ Successful: ${successCount} lessons`);
    console.log(`   ❌ Errors: ${errorCount} lessons`);

    const totalLessons = await Lesson.count();
    console.log(`\n📊 Total lessons in database: ${totalLessons}`);
  } catch (error) {
    console.error("\n❌ Fatal error:", error.message);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  await sequelize.authenticate();
  await loadAllLessons();
  process.exit(0);
}

export default loadAllLessons;
