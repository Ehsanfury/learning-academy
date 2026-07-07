/**
 * seed-dictionary.js
 * Path: backend/scripts/seed-dictionary.js
 * Description: Seed vocabulary into database
 * Run: node scripts/seed-dictionary.js
 */

import sequelize from "../config/db.js";
import { Vocabulary } from "../models/index.js";

const VOCABULARY = [
  // از درس ۱
  {
    id: "voc-hallo",
    de: "Hallo",
    fa: "سلام",
    en: "Hello",
    level: "A1",
    category: "greetings",
    partOfSpeech: "interjection",
    pronunciation: "ها-لو",
    example: { de: "Hallo, wie geht's?", fa: "سلام، چطوری؟", en: "Hello, how are you?" },
  },
  {
    id: "voc-tschüss",
    de: "Tschüss",
    fa: "خداحافظ",
    en: "Goodbye",
    level: "A1",
    category: "greetings",
    partOfSpeech: "interjection",
    pronunciation: "چوس",
    example: { de: "Tschüss, bis morgen!", fa: "خداحافظ، تا فردا!", en: "Bye, see you tomorrow!" },
  },
  // از درس ۲
  {
    id: "voc-vater",
    de: "Vater",
    fa: "پدر",
    en: "father",
    level: "A1",
    category: "family",
    gender: "der",
    plural: "Väter",
    pronunciation: "فا-تِر",
    example: { de: "Mein Vater heißt Ali.", fa: "پدرم علی است.", en: "My father's name is Ali." },
  },
  {
    id: "voc-mutter",
    de: "Mutter",
    fa: "مادر",
    en: "mother",
    level: "A1",
    category: "family",
    gender: "die",
    plural: "Mütter",
    pronunciation: "مو-تِر",
    example: {
      de: "Meine Mutter heißt Fatemeh.",
      fa: "مادرم فاطمه است.",
      en: "My mother's name is Fatemeh.",
    },
  },
  {
    id: "voc-bruder",
    de: "Bruder",
    fa: "برادر",
    en: "brother",
    level: "A1",
    category: "family",
    gender: "der",
    plural: "Brüder",
    pronunciation: "برو-دِر",
    example: {
      de: "Mein Bruder heißt Reza.",
      fa: "برادرم رضا است.",
      en: "My brother's name is Reza.",
    },
  },
  {
    id: "voc-schwester",
    de: "Schwester",
    fa: "خواهر",
    en: "sister",
    level: "A1",
    category: "family",
    gender: "die",
    plural: "Schwestern",
    pronunciation: "شوِس-تِر",
    example: {
      de: "Meine Schwester heißt Maryam.",
      fa: "خواهرم مریم است.",
      en: "My sister's name is Maryam.",
    },
  },
  {
    id: "voc-familie",
    de: "Familie",
    fa: "خانواده",
    en: "family",
    level: "A1",
    category: "family",
    gender: "die",
    plural: "Familien",
    pronunciation: "فا-می-لی-اِ",
    example: { de: "Das ist meine Familie.", fa: "این خانواده من است.", en: "This is my family." },
  },
  {
    id: "voc-freund",
    de: "Freund",
    fa: "دوست (پسر)",
    en: "friend (male)",
    level: "A1",
    category: "people",
    gender: "der",
    plural: "Freunde",
    pronunciation: "فرویند",
    example: {
      de: "Das ist mein Freund Fabio.",
      fa: "این دوست من فابیو است.",
      en: "This is my friend Fabio.",
    },
  },
  {
    id: "voc-freundin",
    de: "Freundin",
    fa: "دوست (دختر)",
    en: "friend (female)",
    level: "A1",
    category: "people",
    gender: "die",
    plural: "Freundinnen",
    pronunciation: "فرویندین",
    example: {
      de: "Das ist meine Freundin Martha.",
      fa: "این دوست من مارتا است.",
      en: "This is my friend Martha.",
    },
  },
  {
    id: "voc-wohnen",
    de: "wohnen",
    fa: "ساکن بودن",
    en: "to live",
    level: "A1",
    category: "verbs",
    partOfSpeech: "verb",
    pronunciation: "وو-نِن",
    example: { de: "Ich wohne in Berlin.", fa: "من در برلین ساکنم.", en: "I live in Berlin." },
  },
  {
    id: "voc-kommen",
    de: "kommen",
    fa: "آمدن",
    en: "to come",
    level: "A1",
    category: "verbs",
    partOfSpeech: "verb",
    pronunciation: "کوم-اِن",
    example: { de: "Ich komme aus Iran.", fa: "من از ایران هستم.", en: "I come from Iran." },
  },
  {
    id: "voc-sprechen",
    de: "sprechen",
    fa: "صحبت کردن",
    en: "to speak",
    level: "A1",
    category: "verbs",
    partOfSpeech: "verb",
    pronunciation: "اِ-شپر-خِن",
    example: { de: "Ich spreche Deutsch.", fa: "من آلمانی صحبت می‌کنم.", en: "I speak German." },
  },
  {
    id: "voc-lernen",
    de: "lernen",
    fa: "یاد گرفتن",
    en: "to learn",
    level: "A1",
    category: "verbs",
    partOfSpeech: "verb",
    pronunciation: "لِر-نِن",
    example: { de: "Ich lerne Deutsch.", fa: "من آلمانی یاد می‌گیرم.", en: "I learn German." },
  },
  {
    id: "voc-alt",
    de: "alt",
    fa: "مسن / قدیمی",
    en: "old",
    level: "A1",
    category: "adjectives",
    partOfSpeech: "adjective",
    pronunciation: "آلت",
    example: { de: "Wie alt bist du?", fa: "چند سالته؟", en: "How old are you?" },
  },
];

async function seedDictionary() {
  console.log("\n📚 ========================================");
  console.log("📚  Seeding Dictionary");
  console.log("📚 ========================================\n");

  try {
    await sequelize.authenticate();
    console.log("✅ Connected to database\n");

    let created = 0;
    let updated = 0;

    for (const wordData of VOCABULARY) {
      try {
        const existing = await Vocabulary.findByPk(wordData.id);

        if (existing) {
          await existing.update(wordData);
          updated++;
          console.log(`  🔄 Updated: ${wordData.id} (${wordData.de})`);
        } else {
          await Vocabulary.create(wordData);
          created++;
          console.log(`  ✅ Created: ${wordData.id} (${wordData.de})`);
        }
      } catch (error) {
        console.error(`  ❌ Error with ${wordData.id}:`, error.message);
      }
    }

    const total = await Vocabulary.count();
    console.log(`\n📊 Total words in dictionary: ${total}`);
  } catch (error) {
    console.error("❌ Fatal error:", error.message);
  } finally {
    await sequelize.close();
    console.log("\n🔒 Database connection closed");
  }
}

seedDictionary();
