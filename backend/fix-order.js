/**
 * fix-order.js
 * Path: backend/scripts/fix-order.js
 * Description: Fix lesson order in database (Auto-detect)
 * Run: node scripts/fix-order.js
 * Changes:
 * - ✅ Auto-detects all lessons by ID order
 * - ✅ No manual list needed
 * - ✅ Shows detailed output
 */

import sequelize from "../config/db.js";

async function fixOrder() {
  console.log("\n🔧 ========================================");
  console.log("🔧  Fixing Lesson Order (Auto-Detect)");
  console.log("🔧 ========================================\n");

  try {
    await sequelize.authenticate();
    console.log("✅ Connected to database\n");

    // ✅ دریافت خودکار همه درس‌ها بر اساس ID
    const [allLessons] = await sequelize.query(`
      SELECT id, total_sections, title
      FROM lessons 
      WHERE id LIKE 'a1-l%' 
      ORDER BY id
    `);

    if (allLessons.length === 0) {
      console.log("⚠️ No A1 lessons found in database!");
      await sequelize.close();
      return;
    }

    console.log(`📁 Found ${allLessons.length} lessons\n`);

    // ✅ اصلاح ترتیب بر اساس ID
    for (let i = 0; i < allLessons.length; i++) {
      const id = allLessons[i].id;
      const newOrder = i + 1;

      await sequelize.query(`UPDATE lessons SET "order" = ${newOrder} WHERE id = '${id}'`);

      const title =
        typeof allLessons[i].title === "object"
          ? allLessons[i].title?.fa || allLessons[i].id
          : allLessons[i].id;
      const hasContent = allLessons[i].total_sections > 0 ? "✅" : "⚠️";
      console.log(
        `   ${hasContent} ${String(newOrder).padStart(2)}. ${id.padEnd(10)} → ${title.substring(0, 30)} (${allLessons[i].total_sections} sections)`
      );
    }

    // نمایش نتیجه نهایی
    const [result] = await sequelize.query(`
      SELECT id, "order", total_sections
      FROM lessons 
      WHERE id LIKE 'a1-l%' 
      ORDER BY "order"
    `);

    console.log("\n📊 ========================================");
    console.log("📊  Updated Orders");
    console.log("📊 ========================================");

    let totalWithContent = 0;
    result.forEach((row) => {
      const hasContent = row.total_sections > 0;
      const status = hasContent ? "✅" : "⚠️";
      const statusText = hasContent ? `${row.total_sections} sections` : "EMPTY";
      if (hasContent) totalWithContent++;
      console.log(
        `   ${status} ${String(row.order).padStart(2)}. ${row.id.padEnd(10)} (${statusText})`
      );
    });

    console.log("📊 ========================================");
    console.log(`   ✅ With content: ${totalWithContent}/${result.length}`);
    console.log(`   ⚠️ Without content: ${result.length - totalWithContent}/${result.length}`);
    console.log("📊 ========================================");

    console.log("\n✅ Orders updated successfully");
    await sequelize.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Stack:", error.stack);
    await sequelize.close();
  }
}

// اجرا اگر فایل به صورت مستقیم اجرا شود
if (import.meta.url === `file://${process.argv[1]}`) {
  fixOrder();
}

export default fixOrder;
