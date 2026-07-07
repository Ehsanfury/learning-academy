/**
 * seed-stories.js
 * Path: backend/scripts/seed-stories.js
 * Description: Seed stories into database
 * Run: node scripts/seed-stories.js
 */

import sequelize from "../config/db.js";
import { Story } from "../models/index.js";

const STORIES = [
  {
    id: "story-a1-01",
    level: "A1",
    title: {
      fa: "روز اول در برلین",
      en: "First Day in Berlin",
      de: "Erster Tag in Berlin",
    },
    description: {
      fa: "داستان کوتاه درباره اولین روز یک دانشجو در برلین",
      en: "A short story about a student's first day in Berlin",
      de: "Eine Kurzgeschichte über den ersten Tag eines Studenten in Berlin",
    },
    icon: "🏙️",
    paragraphs: [
      {
        de: "Hallo! Ich heiße Anna.",
        fa: "سلام! اسم من آنا است.",
        en: "Hello! My name is Anna.",
      },
      {
        de: "Ich komme aus Italien und wohne jetzt in Berlin.",
        fa: "من از ایتالیا هستم و الان در برلین زندگی می‌کنم.",
        en: "I'm from Italy and I live in Berlin now.",
      },
      {
        de: "Berlin ist eine schöne Stadt.",
        fa: "برلین شهر زیبایی است.",
        en: "Berlin is a beautiful city.",
      },
    ],
    quiz: [
      {
        id: "q1",
        type: "multiple_choice",
        question: {
          fa: "آنا اهل کجاست؟",
          en: "Where is Anna from?",
          de: "Woher kommt Anna?",
        },
        options: ["آلمان", "ایتالیا", "فرانسه", "اسپانیا"],
        correct: 1,
        explanation: {
          fa: "آنا می‌گوید: Ich komme aus Italien.",
          en: "Anna says: Ich komme aus Italien.",
          de: "Anna sagt: Ich komme aus Italien.",
        },
      },
    ],
    xpReward: 30,
    estimatedMinutes: 5,
    isActive: true,
  },
  {
    id: "story-a1-02",
    level: "A1",
    title: {
      fa: "در کافه",
      en: "At the Café",
      de: "Im Café",
    },
    description: {
      fa: "یک گفتگوی ساده در کافه",
      en: "A simple conversation at the café",
      de: "Ein einfaches Gespräch im Café",
    },
    icon: "☕",
    paragraphs: [
      {
        de: "Ich bin im Café.",
        fa: "من در کافه هستم.",
        en: "I'm at the café.",
      },
      {
        de: "Ich möchte einen Kaffee, bitte.",
        fa: "یک قهوه می‌خواهم، خواهش می‌کنم.",
        en: "I would like a coffee, please.",
      },
    ],
    quiz: [],
    xpReward: 25,
    estimatedMinutes: 4,
    isActive: true,
  },
];

async function seedStories() {
  console.log("\n📚 ========================================");
  console.log("📚  Seeding Stories");
  console.log("📚 ========================================\n");

  try {
    await sequelize.authenticate();
    console.log("✅ Connected to database\n");

    let created = 0;
    let updated = 0;

    for (const storyData of STORIES) {
      const existing = await Story.findByPk(storyData.id);

      if (existing) {
        await existing.update(storyData);
        updated++;
        console.log(`  🔄 Updated: ${storyData.id}`);
      } else {
        await Story.create(storyData);
        created++;
        console.log(`  ✅ Created: ${storyData.id}`);
      }
    }

    const total = await Story.count();
    console.log(`\n📊 Total stories: ${total}`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await sequelize.close();
    console.log("\n🔒 Database connection closed");
  }
}

seedStories();
