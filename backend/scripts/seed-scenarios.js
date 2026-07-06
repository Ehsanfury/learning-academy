/**
 * seed-scenarios.js
 * Path: backend/scripts/seed-scenarios.js
 * Description: Seed scenarios from lesson content
 * Run: node scripts/seed-scenarios.js
 */

import sequelize from "../config/db.js";
import { Scenario } from "../models/index.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_PATH = path.join(__dirname, "../../content/courses/A1/lessons");

function createGreetingScenarios(lessonData, lessonId) {
  const scenarios = [];

  if (lessonData.greetings && lessonData.greetings.items) {
    const items = lessonData.greetings.items;

    const greetingScenario = {
      id: `scenario-greeting-${lessonId.toLowerCase()}`,
      level: lessonData.level || "A1",
      title: {
        fa: "احوال‌پرسی در موقعیت‌های مختلف",
        en: "Greetings in Different Situations",
        de: "Begrüßungen in verschiedenen Situationen",
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

  return scenarios;
}

async function seedScenarios() {
  console.log("\n🎭 ========================================");
  console.log("🎭  Seeding Scenarios from Lessons");
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

    for (const file of files) {
      const filePath = path.join(CONTENT_PATH, file);
      const lessonId = path.basename(file, ".json");

      try {
        const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const allScenarios = [];

        const greetingScenarios = createGreetingScenarios(content, lessonId);
        allScenarios.push(...greetingScenarios);

        if (allScenarios.length === 0) {
          console.log(`  ℹ️ No scenarios found in ${file}`);
          continue;
        }

        console.log(`  📖 ${file}: ${allScenarios.length} scenarios`);

        for (const scenarioData of allScenarios) {
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

    const totalCount = await Scenario.count();
    console.log(`   📊 Total scenarios: ${totalCount}`);
  } catch (error) {
    console.error("\n❌ Fatal error:", error.message);
  } finally {
    await sequelize.close();
    console.log("\n🔒 Database connection closed");
  }
}

seedScenarios();
