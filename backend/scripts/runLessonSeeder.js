/**
 * runLessonSeeder.js
 * Path: backend/scripts/runLessonSeeder.js
 * Description: Run the lesson seeder and auto-fix order
 * Version: 5.0 - Fully automatic order detection
 * Changes:
 * - ✅ Auto-detects all lessons by ID order
 * - ✅ No need to manually list lesson IDs
 * - ✅ Handles any number of lessons
 * - ✅ Shows detailed output
 */

import sequelize from "../config/db.js";
import seedLessons from "../seeders/LessonSeeder.js";

async function run() {
  console.log("\n🚀 ========================================");
  console.log("🚀  Running Lesson Seeder + Order Fix");
  console.log("🚀 ========================================\n");

  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully\n");

    await sequelize.sync({ alter: true });
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

    // ✅ دریافت خودکار همه درس‌ها بر اساس ID (a1-l01, a1-l02, ...)
    const [allLessons] = await sequelize.query(`
      SELECT id, total_sections, title
      FROM lessons 
      WHERE id LIKE 'a1-l%' 
      ORDER BY id
    `);

    if (allLessons.length === 0) {
      console.log("⚠️ No A1 lessons found in database!");
    } else {
      console.log(`📁 Found ${allLessons.length} lessons\n`);

      // ✅ اصلاح ترتیب بر اساس ID
      for (let i = 0; i < allLessons.length; i++) {
        const id = allLessons[i].id;
        const newOrder = i + 1;

        await sequelize.query(`UPDATE lessons SET "order" = ${newOrder} WHERE id = '${id}'`);

        // نمایش پیشرفت
        const title =
          typeof allLessons[i].title === "object"
            ? allLessons[i].title?.fa || allLessons[i].id
            : allLessons[i].id;
        const hasContent = allLessons[i].total_sections > 0 ? "✅" : "⚠️";
        console.log(
          `   ${hasContent} ${String(newOrder).padStart(2)}. ${id.padEnd(10)} → ${title.substring(0, 30).padEnd(30)} (${allLessons[i].total_sections} sections)`
        );
      }
    }

    // ============================================
    // 3. نمایش نتیجه نهایی
    // ============================================
    const [result] = await sequelize.query(`
      SELECT id, "order", total_sections, title
      FROM lessons 
      WHERE id LIKE 'a1-l%' 
      ORDER BY "order"
    `);

    console.log("\n📊 ========================================");
    console.log("📊  Final Lesson Order");
    console.log("📊 ========================================");

    let totalWithContent = 0;
    result.forEach((row) => {
      const title = typeof row.title === "object" ? row.title?.fa || row.id : row.id;
      const hasContent = row.total_sections > 0;
      const status = hasContent ? "✅" : "⚠️";
      const statusText = hasContent ? `${row.total_sections} sections` : "EMPTY";

      if (hasContent) totalWithContent++;

      const orderStr = String(row.order).padStart(2, " ");
      console.log(
        `   ${status} ${orderStr}. ${row.id.padEnd(10)} → ${title.substring(0, 35).padEnd(35)} (${statusText})`
      );
    });

    console.log("📊 ========================================");
    console.log(`   ✅ Lessons with content: ${totalWithContent}/${result.length}`);
    console.log(
      `   ⚠️ Lessons without content: ${result.length - totalWithContent}/${result.length}`
    );
    console.log("📊 ========================================");

    // ============================================
    // 4. بررسی درس‌های گم‌شده (مقایسه با فایل‌های موجود)
    // ============================================
    console.log("\n📁 Checking for missing lessons...");

    // دریافت لیست فایل‌های موجود
    const fs = await import("fs");
    const path = await import("path");
    const contentPath = path.join(process.cwd(), "../content/courses/A1/lessons");

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
