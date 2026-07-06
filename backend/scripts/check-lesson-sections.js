/**
 * check-lesson-sections.js
 * Path: backend/scripts/check-lesson-sections.js
 * Description: Check lesson sections in database
 * Run: node scripts/check-lesson-sections.js
 */

import sequelize from "../config/db.js";

async function checkLessonSections(lessonId = "a1-l02") {
  console.log("\n📚 ========================================");
  console.log(`📚  Checking Lesson: ${lessonId}`);
  console.log("📚 ========================================\n");

  try {
    await sequelize.authenticate();
    console.log("✅ Connected to database\n");

    const [result] = await sequelize.query(`
      SELECT id, title, sections, total_sections 
      FROM lessons 
      WHERE id = '${lessonId}'
    `);

    if (!result || result.length === 0) {
      console.log(`❌ Lesson "${lessonId}" not found!`);
      await sequelize.close();
      return;
    }

    const lesson = result[0];

    console.log(`📖 ${lesson.id}: ${lesson.title?.fa || lesson.id}`);
    console.log(`   Total Sections: ${lesson.total_sections || 0}\n`);

    if (lesson.sections && lesson.sections.length > 0) {
      console.log("📋 Sections:\n");
      lesson.sections.forEach((s, i) => {
        const hasContent =
          (s.items && s.items.length > 0) ||
          (s.topics && s.topics.length > 0) ||
          (s.quiz && s.quiz.length > 0) ||
          (s.data && Object.keys(s.data).length > 0) ||
          (s.content && Object.keys(s.content).length > 0);

        const status = hasContent ? "✅" : "⚠️";
        const title = s.title?.fa || s.title || s.type || "بدون عنوان";
        console.log(`   ${status} ${String(i + 1).padStart(2)}. ${s.type.padEnd(20)} → ${title}`);

        // نمایش جزئیات بیشتر
        if (s.type === "vocabulary" && s.items) {
          console.log(`       📝 ${s.items.length} واژگان`);
        }
        if (s.type === "grammar" && s.topics) {
          console.log(`       📝 ${s.topics.length} موضوع گرامری`);
        }
        if (s.type === "exercises" && s.data) {
          const exerciseTypes = Object.keys(s.data);
          console.log(`       📝 تمرین‌ها: ${exerciseTypes.join(", ")}`);
        }
        if (s.type === "review" && s.quiz) {
          console.log(`       📝 ${s.quiz.length} سوال مرور`);
        }
      });

      console.log(`\n📊 Total sections: ${lesson.sections.length}`);

      // آمار محتوا
      const withContent = lesson.sections.filter(
        (s) =>
          (s.items && s.items.length > 0) ||
          (s.topics && s.topics.length > 0) ||
          (s.quiz && s.quiz.length > 0) ||
          (s.data && Object.keys(s.data).length > 0) ||
          (s.content && Object.keys(s.content).length > 0)
      ).length;

      console.log(`   ✅ With content: ${withContent}/${lesson.sections.length}`);
      console.log(`   ⚠️ Empty: ${lesson.sections.length - withContent}/${lesson.sections.length}`);
    } else {
      console.log("⚠️ No sections found in this lesson!");
    }

    console.log("\n✅ ========================================");
    console.log("✅  Check completed!");
    console.log("✅ ========================================\n");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    await sequelize.close();
    console.log("🔒 Database connection closed");
  }
}

// اجرا با آرگومان خط فرمان
const lessonId = process.argv[2] || "a1-l02";
checkLessonSections(lessonId);
