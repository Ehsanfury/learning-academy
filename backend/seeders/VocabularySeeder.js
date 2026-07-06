/**
 * VocabularySeeder.js
 * Path: backend/seeders/VocabularySeeder.js
 * Description: Seed vocabulary words from lesson content
 */

import { Vocabulary } from "../models/index.js";
import sequelize from "../config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_PATH = path.join(__dirname, "../../content/courses/A1/lessons");

/**
 * Extract vocabulary from lesson content
 */
function extractVocabulary(content, lessonId) {
  const vocabulary = [];

  if (content.vocabulary && Array.isArray(content.vocabulary)) {
    content.vocabulary.forEach((item) => {
      vocabulary.push({
        id: item.id || `voc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        de: item.de || "",
        fa: item.fa || "",
        en: item.en || "",
        level: content.level || "A1",
        category: "general",
        partOfSpeech: item.article ? "noun" : "other",
        gender: item.article || "",
        plural: item.plural || "",
        pronunciation: item.ipa || "",
        example: item.example || {},
        audioUrl: null,
        lessonId: lessonId,
        easeFactor: 2.5,
        interval: 1,
        repetitions: 0,
      });
    });
  }

  return vocabulary;
}

/**
 * Seed vocabulary from all lessons
 */
export async function seedVocabulary() {
  console.log("\n📚 ========================================");
  console.log("📚  Seeding Vocabulary");
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

    let totalVocabulary = 0;
    let created = 0;
    let updated = 0;

    for (const file of files) {
      const filePath = path.join(CONTENT_PATH, file);

      try {
        const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const lessonId = content.id || path.basename(file, ".json");

        const vocabularyItems = extractVocabulary(content, lessonId);

        if (vocabularyItems.length === 0) {
          console.log(`  ℹ️ No vocabulary found in ${file}`);
          continue;
        }

        console.log(`  📖 ${file}: ${vocabularyItems.length} words`);

        for (const item of vocabularyItems) {
          try {
            const existing = await Vocabulary.findOne({
              where: { de: item.de },
            });

            if (existing) {
              await existing.update(item);
              updated++;
            } else {
              await Vocabulary.create(item);
              created++;
            }
            totalVocabulary++;
          } catch (err) {
            console.error(`    ❌ Error saving word ${item.de}:`, err.message);
          }
        }
      } catch (error) {
        console.error(`  ❌ Error with ${file}:`, error.message);
      }
    }

    console.log("\n📊 ========================================");
    console.log("📊  Seeding Complete!");
    console.log("📊 ========================================");
    console.log(`   ✅ Created: ${created} words`);
    console.log(`   🔄 Updated: ${updated} words`);
    console.log(`   📊 Total vocabulary items: ${totalVocabulary}`);

    const sample = await Vocabulary.findOne();
    if (sample) {
      console.log(`\n📖 Sample word:`);
      console.log(`   DE: ${sample.de}`);
      console.log(`   FA: ${sample.fa}`);
      console.log(`   Level: ${sample.level}`);
    }
  } catch (error) {
    console.error("\n❌ Fatal error:", error.message);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  await sequelize.authenticate();
  await seedVocabulary();
  process.exit(0);
}

export default seedVocabulary;
