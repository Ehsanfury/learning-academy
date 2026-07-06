/**
 * add-lesson-id-to-vocabulary.js
 * Path: backend/scripts/add-lesson-id-to-vocabulary.js
 * Description: Add lesson_id column to vocabulary table
 * Run: node scripts/add-lesson-id-to-vocabulary.js
 */

import sequelize from "../config/db.js";
import { DataTypes } from "sequelize";

async function addLessonIdColumn() {
  console.log("\n🔄 ========================================");
  console.log("🔄  Adding lesson_id to vocabulary");
  console.log("🔄 ========================================\n");

  try {
    await sequelize.authenticate();
    console.log("✅ Database connected\n");

    // 1. Check if column exists
    const [result] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'vocabulary' 
      AND column_name = 'lesson_id'
    `);

    if (result.length > 0) {
      console.log("✅ Column 'lesson_id' already exists");
      await sequelize.close();
      return;
    }

    // 2. Add the column
    console.log("📝 Adding lesson_id column...");
    await sequelize.query(`
      ALTER TABLE vocabulary 
      ADD COLUMN lesson_id VARCHAR(50)
    `);
    console.log("✅ Column added");

    // 3. Add index
    console.log("📝 Adding index on lesson_id...");
    await sequelize.query(`
      CREATE INDEX idx_vocabulary_lesson_id ON vocabulary (lesson_id)
    `);
    console.log("✅ Index added");

    console.log("\n✅ ========================================");
    console.log("✅  Migration completed successfully!");
    console.log("✅ ========================================\n");
  } catch (error) {
    console.error("\n❌ ========================================");
    console.error("❌  Migration failed!");
    console.error("❌ ========================================");
    console.error("❌ Error:", error.message);
    console.error("\n📋 Stack trace:");
    console.error(error.stack);
  } finally {
    await sequelize.close();
    console.log("\n🔒 Database connection closed");
  }
}

addLessonIdColumn();
