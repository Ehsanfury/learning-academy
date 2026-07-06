/**
 * fix-order.js
 * Path: backend/scripts/fix-order.js
 * Description: Fix lesson order in database
 * Run: node scripts/fix-order.js
 */

import sequelize from "../config/db.js";

async function fixOrder() {
  console.log("\n🔄 ========================================");
  console.log("🔄  Fixing Lesson Order");
  console.log("🔄 ========================================\n");

  try {
    await sequelize.authenticate();
    console.log("✅ Connected to database\n");

    // 1. اصلاح order درس a1-l01 به 1
    await sequelize.query(`UPDATE lessons SET "order" = 1 WHERE id = 'a1-l01'`);
    console.log("✅ Updated a1-l01 order to 1");

    // 2. اصلاح order درس a1-l02 به 2
    await sequelize.query(`UPDATE lessons SET "order" = 2 WHERE id = 'a1-l02'`);
    console.log("✅ Updated a1-l02 order to 2");

    // 3. اصلاح order درس a1-l03 به 3
    await sequelize.query(`UPDATE lessons SET "order" = 3 WHERE id = 'a1-l03'`);
    console.log("✅ Updated a1-l03 order to 3");

    // 4. اصلاح order درس a1-l04 به 4
    await sequelize.query(`UPDATE lessons SET "order" = 4 WHERE id = 'a1-l04'`);
    console.log("✅ Updated a1-l04 order to 4");

    // 5. اصلاح order درس a1-l05 به 5
    await sequelize.query(`UPDATE lessons SET "order" = 5 WHERE id = 'a1-l05'`);
    console.log("✅ Updated a1-l05 order to 5");

    // 6. اصلاح order درس a1-l06 به 6
    await sequelize.query(`UPDATE lessons SET "order" = 6 WHERE id = 'a1-l06'`);
    console.log("✅ Updated a1-l06 order to 6");

    // 7. اصلاح order درس a1-l07 به 7
    await sequelize.query(`UPDATE lessons SET "order" = 7 WHERE id = 'a1-l07'`);
    console.log("✅ Updated a1-l07 order to 7");

    // 8. اصلاح order درس a1-l08 به 8
    await sequelize.query(`UPDATE lessons SET "order" = 8 WHERE id = 'a1-l08'`);
    console.log("✅ Updated a1-l08 order to 8");

    // 9. اصلاح order درس a1-l09 به 9
    await sequelize.query(`UPDATE lessons SET "order" = 9 WHERE id = 'a1-l09'`);
    console.log("✅ Updated a1-l09 order to 9");

    // 10. اصلاح order درس a1-l10 به 10
    await sequelize.query(`UPDATE lessons SET "order" = 10 WHERE id = 'a1-l10'`);
    console.log("✅ Updated a1-l10 order to 10");

    // 11. اصلاح order درس a1-l11 به 11
    await sequelize.query(`UPDATE lessons SET "order" = 11 WHERE id = 'a1-l11'`);
    console.log("✅ Updated a1-l11 order to 11");

    // 12. اصلاح order درس a1-l12 به 12
    await sequelize.query(`UPDATE lessons SET "order" = 12 WHERE id = 'a1-l12'`);
    console.log("✅ Updated a1-l12 order to 12");

    // 13. اصلاح order درس A1-L01 (با حروف بزرگ) - اگر وجود دارد
    await sequelize.query(`UPDATE lessons SET "order" = 13 WHERE id = 'A1-L01'`);
    console.log("✅ Updated A1-L01 order to 13");

    console.log("\n📊 ========================================");
    console.log("📊  Updated Lessons Order");
    console.log("📊 ========================================");

    // نمایش نتیجه
    const [results] = await sequelize.query(`
      SELECT id, title, "order" 
      FROM lessons 
      WHERE id LIKE 'a1-l%' OR id LIKE 'A1-L%'
      ORDER BY "order" 
      LIMIT 15
    `);

    results.forEach((row) => {
      const title = typeof row.title === "object" ? row.title?.fa || row.id : row.id;
      const isMain = row.id === "a1-l01" || row.id === "A1-L01";
      const emoji = isMain ? "⭐" : "  ";
      console.log(`  ${emoji} ${row.id}: ${title} (order: ${row.order})`);
    });

    console.log("\n✅ ========================================");
    console.log("✅  Order fix completed successfully!");
    console.log("✅ ========================================\n");
  } catch (error) {
    console.error("\n❌ ========================================");
    console.error("❌  Order fix failed!");
    console.error("❌ ========================================");
    console.error("❌ Error:", error.message);
    console.error("\n📋 Stack trace:");
    console.error(error.stack);
  } finally {
    await sequelize.close();
    console.log("\n🔒 Database connection closed");
  }
}

// اجرا
fixOrder();
