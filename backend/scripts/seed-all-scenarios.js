/**
 * seed-all-scenarios.js
 * Path: backend/scripts/seed-all-scenarios.js
 * Description: Seed scenarios from ALL lessons
 * Run: node scripts/seed-all-scenarios.js
 */

import sequelize from "../config/db.js";
import { Scenario } from "../models/index.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_PATH = path.join(__dirname, "../../content/courses/A1/lessons");

// ============================================
// 🎯 Create Scenarios from Lesson Content
// ============================================

function createScenariosFromLesson(content, lessonId) {
  const scenarios = [];
  const level = content.level || "A1";

  // 1. سناریوی احوال‌پرسی (از بخش greetings)
  if (content.greetings && content.greetings.items) {
    const items = content.greetings.items;

    const greetingScenario = {
      id: `scenario-greeting-${lessonId.toLowerCase()}`,
      level: level,
      title: {
        fa: `احوال‌پرسی - ${content.title?.fa || lessonId}`,
        en: `Greetings - ${content.title?.en || lessonId}`,
        de: `Begrüßungen - ${content.title?.de || lessonId}`,
      },
      description: {
        fa: `تمرین احوال‌پرسی با ${items.length} عبارت مختلف`,
        en: `Practice greetings with ${items.length} different phrases`,
        de: `Üben Sie Begrüßungen mit ${items.length} verschiedenen Phrasen`,
      },
      icon: "👋",
      xpReward: 30,
      estimatedMinutes: 10,
      startMessage: {
        fa: "به سناریوی احوال‌پرسی خوش آمدید! شما در موقعیت‌های مختلف قرار می‌گیرید و باید احوال‌پرسی مناسب را انتخاب کنید.",
        en: "Welcome to the greeting scenario! You'll be placed in different situations and need to choose the right greeting.",
        de: "Willkommen zum Begrüßungsszenario! Sie werden in verschiedenen Situationen die richtige Begrüßung wählen.",
      },
      steps: items.map((item, index) => ({
        id: `step-${index}`,
        type: "greeting",
        text: {
          fa: `موقعیت: ${item.time || "همه وقت"} • رسمیت: ${item.formality || "دوستانه"}`,
          en: `Situation: ${item.time || "any time"} • Formality: ${item.formality || "informal"}`,
          de: `Situation: ${item.time || "jederzeit"} • Formalität: ${item.formality || "informell"}`,
        },
        options: items.map((opt) => ({
          id: opt.id,
          text: opt.german,
          isCorrect: opt.id === item.id,
        })),
        correctFeedback: {
          fa: `✅ درست! "${item.german}" برای این موقعیت مناسب است.`,
          en: `✅ Correct! "${item.german}" is appropriate for this situation.`,
          de: `✅ Richtig! "${item.german}" ist für diese Situation passend.`,
        },
        wrongFeedback: {
          fa: `❌ نه، برای این موقعیت مناسب نیست. سعی کنید گزینه‌های دیگر را بررسی کنید.`,
          en: `❌ No, it's not appropriate for this situation. Try other options.`,
          de: `❌ Nein, es ist für diese Situation nicht passend. Versuchen Sie andere Optionen.`,
        },
      })),
    };
    scenarios.push(greetingScenario);
  }

  // 2. سناریوی واژگان (از بخش vocabulary)
  if (content.vocabulary && content.vocabulary.length > 0) {
    const items = content.vocabulary;

    const vocabScenario = {
      id: `scenario-vocab-${lessonId.toLowerCase()}`,
      level: level,
      title: {
        fa: `واژگان - ${content.title?.fa || lessonId}`,
        en: `Vocabulary - ${content.title?.en || lessonId}`,
        de: `Wortschatz - ${content.title?.de || lessonId}`,
      },
      description: {
        fa: `تمرین واژگان با ${items.length} کلمه`,
        en: `Practice vocabulary with ${items.length} words`,
        de: `Üben Sie Wortschatz mit ${items.length} Wörtern`,
      },
      icon: "📚",
      xpReward: 40,
      estimatedMinutes: 15,
      startMessage: {
        fa: "به سناریوی واژگان خوش آمدید! معنی درست کلمات آلمانی را انتخاب کنید.",
        en: "Welcome to the vocabulary scenario! Choose the correct meaning of German words.",
        de: "Willkommen zum Wortschatzszenario! Wählen Sie die richtige Bedeutung der deutschen Wörter.",
      },
      steps: items.slice(0, 6).map((item, index) => ({
        id: `step-${index}`,
        type: "vocabulary",
        text: {
          fa: `کلمه "${item.de}" به چه معنی است؟`,
          en: `What does "${item.de}" mean?`,
          de: `Was bedeutet "${item.de}"?`,
        },
        options: [
          { id: "opt1", text: item.fa || item.en, isCorrect: true },
          { id: "opt2", text: "آب", isCorrect: false },
          { id: "opt3", text: "کتاب", isCorrect: false },
          { id: "opt4", text: "خانه", isCorrect: false },
        ],
        correctFeedback: {
          fa: `✅ درست! "${item.de}" یعنی "${item.fa || item.en}"`,
          en: `✅ Correct! "${item.de}" means "${item.fa || item.en}"`,
          de: `✅ Richtig! "${item.de}" bedeutet "${item.fa || item.en}"`,
        },
        wrongFeedback: {
          fa: `❌ نه، "${item.de}" یعنی "${item.fa || item.en}"`,
          en: `❌ No, "${item.de}" means "${item.fa || item.en}"`,
          de: `❌ Nein, "${item.de}" bedeutet "${item.fa || item.en}"`,
        },
      })),
    };
    scenarios.push(vocabScenario);
  }

  // 3. سناریوی دیالوگ (از بخش dialogues)
  if (content.dialogues && content.dialogues.items) {
    const dialogues = content.dialogues.items;

    dialogues.forEach((dialog, idx) => {
      if (dialog.lines && dialog.lines.length > 0) {
        const dialogScenario = {
          id: `scenario-dialog-${lessonId.toLowerCase()}-${idx}`,
          level: level,
          title: dialog.title || {
            fa: `دیالوگ ${idx + 1}`,
            en: `Dialogue ${idx + 1}`,
            de: `Dialog ${idx + 1}`,
          },
          description: {
            fa: "تمرین مکالمه با دیالوگ‌های واقعی",
            en: "Practice conversation with real dialogues",
            de: "Üben Sie Konversation mit echten Dialogen",
          },
          icon: "💬",
          xpReward: 50,
          estimatedMinutes: 20,
          startMessage: {
            fa: "در این سناریو، شما یک دیالوگ را تمرین می‌کنید. جمله‌ها را به ترتیب صحیح بچینید.",
            en: "In this scenario, you'll practice a dialogue. Arrange the sentences in the correct order.",
            de: "In diesem Szenario üben Sie einen Dialog. Ordnen Sie die Sätze in der richtigen Reihenfolge.",
          },
          steps: dialog.lines.map((line, lineIdx) => ({
            id: `step-${lineIdx}`,
            type: "dialogue",
            speaker: line.speaker,
            text: {
              fa: line.german,
              en: line.german,
              de: line.german,
            },
            translation: line.meaning || {},
            order: lineIdx,
          })),
        };
        scenarios.push(dialogScenario);
      }
    });
  }

  return scenarios;
}

// ============================================
// 🚀 Main Seeder
// ============================================

async function seedAllScenarios() {
  console.log("\n🎭 ========================================");
  console.log("🎭  Seeding ALL Scenarios");
  console.log("🎭 ========================================\n");

  try {
    await sequelize.authenticate();
    console.log("✅ Connected to database\n");

    if (!fs.existsSync(CONTENT_PATH)) {
      console.error(`❌ Content directory not found: ${CONTENT_PATH}`);
      return;
    }

    const files = fs.readdirSync(CONTENT_PATH).filter((f) => f.endsWith(".json"));
    console.log(`📁 Found ${files.length} lesson files\n`);

    let totalCreated = 0;
    let totalUpdated = 0;
    let totalScenarios = 0;

    for (const file of files) {
      const filePath = path.join(CONTENT_PATH, file);
      const lessonId = path.basename(file, ".json");

      try {
        const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const scenarios = createScenariosFromLesson(content, lessonId);

        if (scenarios.length === 0) {
          console.log(`  ℹ️ No scenarios in ${file}`);
          continue;
        }

        console.log(`  📖 ${file}: ${scenarios.length} scenarios`);
        totalScenarios += scenarios.length;

        for (const scenarioData of scenarios) {
          try {
            const existing = await Scenario.findByPk(scenarioData.id);

            if (existing) {
              await existing.update(scenarioData);
              totalUpdated++;
              console.log(`    🔄 Updated: ${scenarioData.id}`);
            } else {
              await Scenario.create(scenarioData);
              totalCreated++;
              console.log(`    ✅ Created: ${scenarioData.id}`);
            }
          } catch (error) {
            console.error(`    ❌ Error saving ${scenarioData.id}:`, error.message);
          }
        }
      } catch (error) {
        console.error(`  ❌ Error processing ${file}:`, error.message);
      }
    }

    console.log("\n📊 ========================================");
    console.log("📊  Seeding Complete!");
    console.log("📊 ========================================");
    console.log(`   ✅ Created: ${totalCreated} scenarios`);
    console.log(`   🔄 Updated: ${totalUpdated} scenarios`);
    console.log(`   📊 Total scenarios generated: ${totalScenarios}`);

    const totalCount = await Scenario.count();
    console.log(`   📊 Total scenarios in DB: ${totalCount}`);
  } catch (error) {
    console.error("\n❌ Fatal error:", error.message);
  } finally {
    await sequelize.close();
    console.log("\n🔒 Database connection closed");
  }
}

seedAllScenarios();
