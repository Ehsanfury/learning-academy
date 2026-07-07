/**
 * LessonSeeder.js
 * Path: backend/seeders/LessonSeeder.js
 * Description: Seed lessons AND vocabulary into database
 * Version: 4.0 - Integrated Vocabulary Seeding
 * Changes:
 * - ✅ Added vocabulary seeding to Vocabulary table
 * - ✅ Full 11 section support including cheatSheet
 * - ✅ Extracts vocabulary from lesson content
 */

import { Lesson, Vocabulary } from "../models/index.js";
import sequelize from "../config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_PATH = path.join(__dirname, "../../content/courses/A1/lessons");

// ============================================
// 🛠️ Helper Functions
// ============================================

function sanitizeNull(value, defaultValue = "") {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  return value;
}

function parseLocalized(value) {
  if (!value) return {};
  if (typeof value === "object" && !Array.isArray(value)) {
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

function safeNumber(value, defaultValue = 0) {
  if (value === null || value === undefined) return defaultValue;
  const num = typeof value === "string" ? parseInt(value) : value;
  return isNaN(num) ? defaultValue : num;
}

// ============================================
// 📚 Build Sections
// ============================================

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

  // 4. Vocabulary (Section)
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

  // ✅ 11. Cheat Sheet
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

// ============================================
// 📖 Extract Vocabulary for Database
// ============================================

function extractVocabularyForDB(content, lessonId) {
  const vocabulary = [];

  if (content.vocabulary && Array.isArray(content.vocabulary)) {
    content.vocabulary.forEach((item) => {
      vocabulary.push({
        id: item.id || `voc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        de: item.de || "",
        fa: item.fa || "",
        en: item.en || "",
        level: content.level || "A1",
        category: item.category || "general",
        partOfSpeech: item.article ? "noun" : "other",
        gender: item.article || "",
        plural: item.plural || "",
        pronunciation: item.ipa || "",
        example: item.example || {},
        audioUrl: null,
        lessonId: lessonId,
        isActive: true,
      });
    });
  }

  return vocabulary;
}

// ============================================
// 📊 Count Functions
// ============================================

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

function countVocabulary(data) {
  if (data.vocabulary && Array.isArray(data.vocabulary)) {
    return data.vocabulary.length;
  }
  return 0;
}

// ============================================
// 🔄 Transform Lesson Data
// ============================================

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

    title: parseLocalized(content.title),
    shortTitle: parseLocalized(content.shortTitle || content.subtitle || content.title),
    description: parseLocalized(
      content.description || content.subtitle || content.lessonIntroduction?.content || ""
    ),
    learningObjectives: parseLocalized(content.learningObjectives),

    xpReward: safeNumber(content.xpReward, 75),
    perfectBonusXP: safeNumber(content.perfectBonusXP, 30),
    completionBonusXP: safeNumber(content.completionBonusXP, 100),

    cefr: sanitizeNull(content.cefr || content.level, "A1.1"),
    goetheChapter: sanitizeNull(content.goetheChapter || content.metadata?.goetheChapter, null),
    tags: content.metadata?.tags || content.tags || [],
    skills: ["reading", "writing", "listening", "speaking"],
    examRelevance: content.examRelevance || null,

    sections: buildSections(content),
    totalSections: buildSections(content).length,
    totalQuestions: countQuestions(content),
    totalVocabulary: countVocabulary(content),

    isActive: true,
    exportable: true,
  };
}

// ============================================
// 🚀 Seed Lessons & Vocabulary
// ============================================

export async function seedLessons() {
  console.log("\n📚 ========================================");
  console.log("📚  Seeding Lessons & Vocabulary");
  console.log("📚 ========================================\n");

  try {
    if (!fs.existsSync(CONTENT_PATH)) {
      console.error(`❌ Content directory not found: ${CONTENT_PATH}`);
      return;
    }

    const files = fs
      .readdirSync(CONTENT_PATH)
      .filter((f) => f.endsWith(".json") && !f.includes("backup"));

    if (files.length === 0) {
      console.error(`❌ No JSON files found in: ${CONTENT_PATH}`);
      return;
    }

    console.log(`📁 Found ${files.length} lesson files\n`);

    let created = 0;
    let updated = 0;
    let vocabCreated = 0;
    let vocabUpdated = 0;
    let errors = 0;

    for (const file of files) {
      const filePath = path.join(CONTENT_PATH, file);

      try {
        const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const fileId = path.basename(file, ".json");
        const lessonId = (content.id || fileId).toLowerCase();

        // 1. Save Lesson
        const lessonData = transformLessonData(content, fileId);
        const existing = await Lesson.findByPk(lessonId);

        if (existing) {
          await existing.update(lessonData);
          updated++;
        } else {
          await Lesson.create(lessonData);
          created++;
        }

        // 2. Save Vocabulary
        const vocabItems = extractVocabularyForDB(content, lessonId);
        if (vocabItems.length > 0) {
          for (const item of vocabItems) {
            try {
              const existingVocab = await Vocabulary.findOne({
                where: { id: item.id },
              });
              if (existingVocab) {
                await existingVocab.update(item);
                vocabUpdated++;
              } else {
                await Vocabulary.create(item);
                vocabCreated++;
              }
            } catch (vocabError) {
              // اگر خطا داشت، با id جدید تلاش کن
              try {
                const newId = `voc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
                await Vocabulary.create({ ...item, id: newId });
                vocabCreated++;
              } catch (e) {
                console.log(`     ⚠️ Could not save vocabulary: ${item.de}`);
              }
            }
          }
        }

        console.log(
          `  ${existing ? "🔄" : "✅"} ${file} → ${lessonData.title?.fa || "بدون عنوان"} (${lessonData.totalSections} sections, ${vocabItems.length} vocab)`
        );
      } catch (error) {
        errors++;
        console.error(`  ❌ Error with ${file}:`, error.message);
      }
    }

    console.log("\n📊 ========================================");
    console.log("📊  Seeding Complete!");
    console.log("📊 ========================================");
    console.log(`   ✅ Created: ${created} lessons`);
    console.log(`   🔄 Updated: ${updated} lessons`);
    console.log(`   📖 Vocabulary: ${vocabCreated} created, ${vocabUpdated} updated`);
    console.log(`   ❌ Errors: ${errors}`);

    const finalCount = await Lesson.count();
    console.log(`\n📊 Total lessons in database: ${finalCount}`);

    const vocabCount = await Vocabulary.count();
    console.log(`📊 Total vocabulary words: ${vocabCount}`);

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
    }

    const sampleVocab = await Vocabulary.findOne();
    if (sampleVocab) {
      console.log(`\n📖 Sample vocabulary:`);
      console.log(`   DE: ${sampleVocab.de}`);
      console.log(`   FA: ${sampleVocab.fa}`);
      console.log(`   Level: ${sampleVocab.level}`);
    }
  } catch (error) {
    console.error("\n❌ Fatal error:", error.message);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await sequelize.authenticate();
  await seedLessons();
  process.exit(0);
}

export default seedLessons;
