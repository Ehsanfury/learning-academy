/**
 * ScenarioSeeder.js
 * Path: backend/seeders/ScenarioSeeder.js
 * Description: Seed scenarios from lesson content files
 * Run: node scripts/runScenarioSeeder.js
 * Changes:
 * - ✅ Extracts scenarios from lesson JSON files
 * - ✅ Creates both local and AI-powered scenarios
 * - ✅ Handles all scenario types
 */

import { Scenario } from "../models/index.js";
import sequelize from "../config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_PATH = path.join(__dirname, "../../content/courses/A1/lessons");

/**
 * Parse localized text
 */
function parseLocalized(value) {
  if (!value) return {};
  if (typeof value === "object") return value;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return { fa: value, en: value, de: value };
    }
  }
  return { fa: String(value), en: String(value), de: String(value) };
}

/**
 * Extract scenarios from lesson content
 */
function extractScenarios(content, lessonId) {
  const scenarios = [];

  // 1. استخراج از بخش exercises.greeting_practice
  if (content.exercises?.greeting_practice) {
    content.exercises.greeting_practice.forEach((exercise, idx) => {
      if (exercise.questions && exercise.questions.length > 0) {
        const steps = exercise.questions.map((q, qIdx) => ({
          id: `step-${idx}-${qIdx}`,
          text: parseLocalized(q.situation || q.question),
          prompt: {
            fa: "چه می‌گویید؟",
            en: "What do you say?",
            de: "Was sagen Sie?",
          },
          options: q.options || [],
          correct: q.options?.[q.correctIndex] || q.correct || "",
          explanation: parseLocalized(q.explanation),
        }));

        scenarios.push({
          id: `scenario-greeting-${lessonId}-${idx}`,
          type: "local",
          level: content.level || "A1",
          title: {
            fa: exercise.title?.fa || "سناریو احوال‌پرسی",
            en: exercise.title?.en || "Greeting Scenario",
            de: exercise.title?.de || "Begrüßungsszenario",
          },
          description: {
            fa: exercise.instructions?.fa || "تمرین احوال‌پرسی در موقعیت‌های مختلف",
            en: exercise.instructions?.en || "Greeting practice in different situations",
            de: exercise.instructions?.de || "Begrüßungsübung in verschiedenen Situationen",
          },
          icon: "👋",
          xpReward: 30,
          estimatedMinutes: 5,
          steps: steps,
          isActive: true,
          lessonId: lessonId,
        });
      }
    });
  }

  // 2. استخراج از بخش exercises.role_play
  if (content.exercises?.role_play) {
    content.exercises.role_play.forEach((exercise, idx) => {
      if (exercise.scenarios) {
        exercise.scenarios.forEach((scenario, sIdx) => {
          const steps = scenario.lines.map((line, lIdx) => ({
            id: `step-${idx}-${sIdx}-${lIdx}`,
            text: parseLocalized({
              fa: line.meaning?.fa || line.text?.fa || `${line.speaker} می‌گوید:`,
              en: line.meaning?.en || line.text?.en || `${line.speaker} says:`,
              de: line.meaning?.de || line.text?.de || `${line.speaker} sagt:`,
            }),
            prompt: {
              fa: "پاسخ مناسب چیست؟",
              en: "What is the appropriate response?",
              de: "Was ist die passende Antwort?",
            },
            options: [line.german || "", "Tschüss!", "Danke!", "Bitte!"].filter(Boolean),
            correct: line.german || "",
            explanation: parseLocalized(line.meaning),
            speaker: line.speaker,
          }));

          scenarios.push({
            id: `scenario-roleplay-${lessonId}-${idx}-${sIdx}`,
            type: "local",
            level: content.level || "A1",
            title: parseLocalized(
              scenario.title || {
                fa: `سناریو نقش‌پردازی ${sIdx + 1}`,
                en: `Role Play Scenario ${sIdx + 1}`,
                de: `Rollenspiel Szenario ${sIdx + 1}`,
              }
            ),
            description: parseLocalized({
              fa: "تمرین مکالمه در موقعیت‌های واقعی",
              en: "Practice conversation in real situations",
              de: "Gespräch in realen Situationen üben",
            }),
            icon: "🎭",
            xpReward: 40,
            estimatedMinutes: 10,
            steps: steps,
            isActive: true,
            lessonId: lessonId,
          });
        });
      }
    });
  }

  // 3. استخراج از بخش dialogues
  if (content.dialogues) {
    content.dialogues.forEach((dialog, idx) => {
      const steps = dialog.lines.map((line, lIdx) => ({
        id: `step-dialog-${idx}-${lIdx}`,
        text: parseLocalized({
          fa: `${line.speaker} می‌گوید: ${line.meaning?.fa || line.german}`,
          en: `${line.speaker} says: ${line.meaning?.en || line.german}`,
          de: `${line.speaker} sagt: ${line.meaning?.de || line.german}`,
        }),
        prompt: {
          fa: "پاسخ بعدی چیست؟",
          en: "What is the next response?",
          de: "Was ist die nächste Antwort?",
        },
        options: dialog.lines
          .filter((_, i) => i !== lIdx)
          .slice(0, 3)
          .map((l) => l.german || ""),
        correct: dialog.lines[lIdx + 1]?.german || "",
        explanation: parseLocalized(line.meaning),
        speaker: line.speaker,
      }));

      if (steps.length > 0) {
        scenarios.push({
          id: `scenario-dialog-${lessonId}-${idx}`,
          type: "local",
          level: content.level || "A1",
          title: parseLocalized(
            dialog.title || {
              fa: "دیالوگ تمرینی",
              en: "Practice Dialogue",
              de: "Übungsdialog",
            }
          ),
          description: parseLocalized({
            fa: "تمرین دیالوگ‌های روزمره",
            en: "Practice everyday dialogues",
            de: "Alltagsdialoge üben",
          }),
          icon: "💬",
          xpReward: 35,
          estimatedMinutes: 8,
          steps: steps,
          isActive: true,
          lessonId: lessonId,
        });
      }
    });
  }

  // 4. سناریوهای هوش مصنوعی (AI Scenarios)
  // این سناریوها توسط AI تولید می‌شوند و dynamic هستند
  // ما یک رکورد placeholder برای آنها ایجاد می‌کنیم
  if (scenarios.length > 0) {
    scenarios.push({
      id: `scenario-ai-${lessonId}`,
      type: "ai",
      level: content.level || "A1",
      title: {
        fa: "سناریو هوش مصنوعی - مکالمه آزاد",
        en: "AI Scenario - Free Conversation",
        de: "KI-Szenario - Freies Gespräch",
      },
      description: {
        fa: "با هوش مصنوعی به زبان آلمانی مکالمه کنید و بازخورد دریافت کنید.",
        en: "Have a conversation in German with AI and get feedback.",
        de: "Führen Sie ein Gespräch auf Deutsch mit KI und erhalten Sie Feedback.",
      },
      icon: "🤖",
      xpReward: 50,
      estimatedMinutes: 15,
      steps: [
        {
          id: "ai-step-1",
          text: {
            fa: "به بخش مکالمه با هوش مصنوعی خوش آمدید! می‌توانید در مورد هر موضوعی که دوست دارید صحبت کنید.",
            en: "Welcome to the AI conversation! You can talk about any topic you like.",
            de: "Willkommen beim KI-Gespräch! Sie können über jedes Thema sprechen, das Sie mögen.",
          },
          prompt: {
            fa: "موضوع مکالمه را انتخاب کنید یا آزادانه صحبت کنید.",
            en: "Choose a conversation topic or speak freely.",
            de: "Wählen Sie ein Gesprächsthema oder sprechen Sie frei.",
          },
          isAi: true,
        },
      ],
      isActive: true,
      lessonId: lessonId,
      isAiScenario: true,
    });
  }

  return scenarios;
}

/**
 * Seed scenarios from all lessons
 */
export async function seedScenarios() {
  console.log("\n🎭 ========================================");
  console.log("🎭  Seeding Scenarios from Lessons");
  console.log("🎭 ========================================\n");

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

    let created = 0;
    let updated = 0;
    let totalScenarios = 0;

    for (const file of files) {
      const filePath = path.join(CONTENT_PATH, file);

      try {
        const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
        const lessonId = content.id || path.basename(file, ".json");

        const scenarios = extractScenarios(content, lessonId);

        if (scenarios.length === 0) {
          console.log(`  ℹ️ No scenarios found in ${file}`);
          continue;
        }

        console.log(`  📖 ${file}: ${scenarios.length} scenarios`);

        for (const scenarioData of scenarios) {
          try {
            const existing = await Scenario.findOne({
              where: { id: scenarioData.id },
            });

            if (existing) {
              await existing.update(scenarioData);
              updated++;
            } else {
              await Scenario.create(scenarioData);
              created++;
            }
            totalScenarios++;
          } catch (err) {
            console.error(`    ❌ Error saving scenario ${scenarioData.id}:`, err.message);
          }
        }
      } catch (error) {
        console.error(`  ❌ Error with ${file}:`, error.message);
      }
    }

    console.log("\n📊 ========================================");
    console.log("📊  Seeding Complete!");
    console.log("📊 ========================================");
    console.log(`   ✅ Created: ${created} scenarios`);
    console.log(`   🔄 Updated: ${updated} scenarios`);
    console.log(`   📊 Total scenarios: ${totalScenarios}`);

    // نمایش نمونه
    const sample = await Scenario.findOne();
    if (sample) {
      console.log(`\n📖 Sample scenario:`);
      console.log(`   ID: ${sample.id}`);
      console.log(`   Title: ${sample.title?.fa || sample.id}`);
      console.log(`   Type: ${sample.type || "local"}`);
      console.log(`   Steps: ${sample.steps?.length || 0}`);
    }
  } catch (error) {
    console.error("\n❌ Fatal error:", error.message);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  await sequelize.authenticate();
  await seedScenarios();
  process.exit(0);
}

export default seedScenarios;
