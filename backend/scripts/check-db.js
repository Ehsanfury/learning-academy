/**
 * check-db.js
 * Path: backend/scripts/check-db.js
 * Description: Check database content
 * Run: node scripts/check-db.js
 */

import sequelize from "../config/db.js";

async function checkDatabase() {
  console.log("\n========================================");
  console.log("  Database Check");
  console.log("========================================\n");

  try {
    await sequelize.authenticate();
    console.log("✅ Connected to database\n");

    // 1. تعداد درس‌ها
    const [countResult] = await sequelize.query("SELECT COUNT(*) FROM lessons");
    console.log(`📚 Total lessons: ${countResult[0].count}\n`);

    // 2. لیست درس‌ها
    const [lessons] = await sequelize.query(`
      SELECT id, title, level, "order", total_sections 
      FROM lessons 
      ORDER BY "order" 
      LIMIT 15
    `);

    console.log("📖 Lessons:");
    lessons.forEach((l) => {
      let title = l.id;
      if (typeof l.title === "object" && l.title !== null) {
        title = l.title.fa || l.id;
      } else if (typeof l.title === "string") {
        try {
          const parsed = JSON.parse(l.title);
          title = parsed.fa || l.id;
        } catch {
          title = l.id;
        }
      }
      const hasSections = l.total_sections > 0 ? "✅" : "  ";
      console.log(
        `  ${hasSections} ${l.id}: ${title} (order: ${l.order}, sections: ${l.total_sections})`
      );
    });

    // 3. بررسی درس a1-l01
    console.log("\n📖 Checking lesson a1-l01:");
    const [lesson] = await sequelize.query(`
      SELECT id, title, level, "order", total_sections, total_vocabulary, total_questions
      FROM lessons 
      WHERE id = 'a1-l01' OR id = 'A1-L01'
    `);

    if (lesson && lesson.length > 0) {
      const l = lesson[0];
      let title = l.id;
      if (typeof l.title === "object" && l.title !== null) {
        title = l.title.fa || l.id;
      }
      console.log(`  ✅ Found: ${l.id}: ${title}`);
      console.log(`     Sections: ${l.total_sections}`);
      console.log(`     Vocabulary: ${l.total_vocabulary}`);
      console.log(`     Questions: ${l.total_questions}`);
    } else {
      console.log("  ❌ Lesson a1-l01 not found!");
    }

    // 4. بررسی ساختار sections
    if (lesson && lesson.length > 0) {
      const [sections] = await sequelize.query(`
        SELECT sections FROM lessons WHERE id = 'a1-l01'
      `);

      if (sections && sections.length > 0) {
        const sectionData = sections[0].sections;
        if (sectionData && Array.isArray(sectionData)) {
          console.log(`\n📋 Section Types in a1-l01:`);
          sectionData.forEach((s, i) => {
            console.log(`  ${i + 1}. ${s.type}: ${s.title?.fa || s.title?.en || "no title"}`);
          });
        } else {
          console.log("\n⚠️ Sections is empty or not an array!");
        }
      }
    }

    console.log("\n========================================");
    console.log("  Check Complete!");
    console.log("========================================\n");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

checkDatabase();
