/**
 * runLessonSeeder.js
 * Path: backend/scripts/runLessonSeeder.js
 * Description: Run the lesson seeder and auto-fix order
 * Version: 6.0 - Fixed seeder execution
 * Changes:
 * - ✅ FIXED: Seeder now properly executes
 * - ✅ Auto-detects all lessons by ID order
 * - ✅ No need to manually list lesson IDs
 * - ✅ Handles any number of lessons
 * - ✅ Shows detailed output
 */

import sequelize from "../config/db.js";
import seedLessons from "../seeders/LessonSeeder.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  console.log("\n🚀 ========================================");
  console.log("🚀  Running Lesson Seeder + Order Fix");
  console.log("🚀 ========================================\n");

  try {
    // Connect to database
    await sequelize.authenticate();
    console.log("✅ Database connected successfully\n");

    // Sync models
    await sequelize.sync({ alter: false });
    console.log("✅ Models synced\n");

    // ============================================
    // 1. Run seeder
    // ============================================
    console.log("📚 Step 1: Seeding lessons...\n");
    await seedLessons();

    // ============================================
    // 2. Fix order - AUTO DETECTION
    // ============================================
    console.log("\n📊 Step 2: Fixing lesson order...\n");

    // دریافت خودکار همه درس‌ها بر اساس ID
    const [allLessons] = await sequelize.query(`
      SELECT id, total_sections, title
      FROM lessons 
      WHERE id LIKE 'A1-L%' OR id LIKE 'a1-l%'
      ORDER BY id
    `);

    if (allLessons.length === 0) {
      console.log("⚠️ No A1 lessons found in database!");
    } else {
      console.log(`📁 Found ${allLessons.length} lessons\n`);

      // اصلاح ترتیب بر اساس ID
      for (let i = 0; i < allLessons.length; i++) {
        const id = allLessons[i].id;
        const newOrder = i + 1;

        await sequelize.query(`UPDATE lessons SET "order" = ${newOrder} WHERE id = '${id}'`);

        // نمایش پیشرفت
        let title = allLessons[i].title;
        if (typeof title === "string") {
          try {
            title = JSON.parse(title);
          } catch (e) {
            title = { fa: title };
          }
        }
        const titleFa = title?.fa || title?.en || id;
        const hasContent = allLessons[i].total_sections > 0;
        const status = hasContent ? "✅" : "⚠️";
        console.log(
          `   ${status} ${String(newOrder).padStart(2)}. ${id.padEnd(10)} → ${titleFa.substring(0, 30).padEnd(30)} (${allLessons[i].total_sections} sections)`
        );
      }
    }

    // ============================================
    // 3. نمایش نتیجه نهایی
    // ============================================
    const [result] = await sequelize.query(`
      SELECT id, "order", total_sections, title
      FROM lessons 
      WHERE id LIKE 'A1-L%' OR id LIKE 'a1-l%'
      ORDER BY "order"
    `);

    console.log("\n📊 ========================================");
    console.log("📊  Final Lesson Order");
    console.log("📊 ========================================");

    let totalWithContent = 0;
    result.forEach((row) => {
      let title = row.title;
      if (typeof title === "string") {
        try {
          title = JSON.parse(title);
        } catch (e) {
          title = { fa: title };
        }
      }
      const titleFa = title?.fa || title?.en || row.id;
      const hasContent = row.total_sections > 0;
      const status = hasContent ? "✅" : "⚠️";
      const statusText = hasContent ? `${row.total_sections} sections` : "EMPTY";

      if (hasContent) totalWithContent++;

      const orderStr = String(row.order).padStart(2, " ");
      console.log(
        `   ${status} ${orderStr}. ${row.id.padEnd(10)} → ${titleFa.substring(0, 35).padEnd(35)} (${statusText})`
      );
    });

    console.log("📊 ========================================");
    console.log(`   ✅ Lessons with content: ${totalWithContent}/${result.length}`);
    console.log(
      `   ⚠️ Lessons without content: ${result.length - totalWithContent}/${result.length}`
    );
    console.log("📊 ========================================");

    // ============================================
    // 4. بررسی درس‌های گم‌شده
    // ============================================
    console.log("\n📁 Checking for missing lessons...");

    const contentPath = path.join(__dirname, "../../content/courses/A1/lessons");

    let existingFiles = [];
    try {
      if (fs.existsSync(contentPath)) {
        existingFiles = fs
          .readdirSync(contentPath)
          .filter((f) => f.endsWith(".json"))
          .map((f) => f.replace(".json", ""));
      }
    } catch (e) {
      // اگر پوشه وجود نداشت، نادیده بگیر
    }

    if (existingFiles.length > 0) {
      const existingIds = result.map((r) => r.id);
      const missingIds = existingFiles.filter((id) => !existingIds.includes(id));

      if (missingIds.length > 0) {
        console.log(`   ⚠️ Missing lessons in database: ${missingIds.join(", ")}`);
        console.log(`   💡 Run seeder again to add them.`);
      } else {
        console.log(`   ✅ All ${existingFiles.length} lessons are in database.`);
      }
    }

    console.log("\n✅ ========================================");
    console.log("✅  Seeder + Order Fix completed successfully!");
    console.log("✅ ========================================\n");
  } catch (error) {
    console.error("\n❌ ========================================");
    console.error("❌  Process failed!");
    console.error("❌ ========================================");
    console.error("❌ Error:", error.message);
    console.error("\n📋 Stack trace:");
    console.error(error.stack);
  } finally {
    await sequelize.close();
    console.log("\n🔒 Database connection closed");
  }
}

run();
