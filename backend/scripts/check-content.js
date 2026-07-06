/**
 * check-content.js
 * Path: backend/scripts/check-content.js
 * Description: Check lesson content files and database
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sequelize from "../config/db.js";
import Lesson from "../models/Lesson.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTENT_DIR = path.join(__dirname, "../../content/courses");

console.log("📊 Content Checker");
console.log("=".repeat(50));

// 1. Check content files
console.log("\n📁 Content Files:");
console.log("-".repeat(30));

if (!fs.existsSync(CONTENT_DIR)) {
  console.log(`❌ Content directory not found: ${CONTENT_DIR}`);
  process.exit(1);
}

const levels = fs.readdirSync(CONTENT_DIR);
console.log(`✅ Found levels: ${levels.join(", ")}`);

let totalFiles = 0;
for (const level of levels) {
  const lessonsPath = path.join(CONTENT_DIR, level, "lessons");
  if (fs.existsSync(lessonsPath)) {
    const files = fs.readdirSync(lessonsPath).filter((f) => f.endsWith(".json"));
    console.log(`   ${level}: ${files.length} files`);
    totalFiles += files.length;
  } else {
    console.log(`   ${level}: ❌ No lessons folder`);
  }
}
console.log(`\n📄 Total JSON files: ${totalFiles}`);

// 2. Check database
console.log("\n🗄️ Database:");
console.log("-".repeat(30));

try {
  await sequelize.authenticate();
  console.log("✅ Database connected");

  const count = await Lesson.count();
  console.log(`📚 Lessons in database: ${count}`);

  if (count > 0) {
    const lessons = await Lesson.findAll({
      attributes: ["id", "level", "lessonNumber", "title"],
      limit: 5,
      order: [
        ["level", "ASC"],
        ["lessonNumber", "ASC"],
      ],
    });
    console.log("\n📖 Sample lessons:");
    lessons.forEach((l) => {
      const title = l.title?.fa || l.title || "No title";
      console.log(`   ${l.level}-L${String(l.lessonNumber).padStart(2, "0")}: ${title}`);
    });
  }
} catch (err) {
  console.error("❌ Database error:", err.message);
}

console.log("\n" + "=".repeat(50));
console.log("✅ Check complete!");
process.exit(0);
