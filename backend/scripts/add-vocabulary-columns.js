/**
 * add-vocabulary-columns.js
 * Path: backend/scripts/add-vocabulary-columns.js
 * Description: Add all missing columns to vocabulary table
 * Run: node scripts/add-vocabulary-columns.js
 */

import sequelize from "../config/db.js";

async function addVocabularyColumns() {
  console.log("\n🔄 ========================================");
  console.log("🔄  Adding missing columns to vocabulary");
  console.log("🔄 ========================================\n");

  try {
    await sequelize.authenticate();
    console.log("✅ Database connected\n");

    // 1. Check existing columns
    const [columns] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'vocabulary'
    `);

    const existingColumns = columns.map((c) => c.column_name);
    console.log(`📋 Existing columns: ${existingColumns.join(", ")}`);
    console.log("");

    // 2. Add missing columns
    const columnsToAdd = [
      { name: "lesson_id", type: "VARCHAR(50)" },
      { name: "ease_factor", type: "FLOAT DEFAULT 2.5" },
      { name: "interval", type: "INTEGER DEFAULT 1" },
      { name: "repetitions", type: "INTEGER DEFAULT 0" },
      { name: "last_review_date", type: "TIMESTAMP" },
      { name: "next_review_date", type: "TIMESTAMP" },
    ];

    for (const col of columnsToAdd) {
      if (!existingColumns.includes(col.name)) {
        console.log(`📝 Adding column: ${col.name}...`);
        await sequelize.query(`
          ALTER TABLE vocabulary 
          ADD COLUMN ${col.name} ${col.type}
        `);
        console.log(`✅ Column ${col.name} added`);
      } else {
        console.log(`⏭️ Column ${col.name} already exists, skipping`);
      }
    }

    // 3. Add indexes
    console.log("\n📝 Adding indexes...");

    const [indexes] = await sequelize.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'vocabulary'
    `);
    const existingIndexes = indexes.map((i) => i.indexname);

    const indexesToAdd = [
      { name: "idx_vocabulary_lesson_id", column: "lesson_id" },
      { name: "idx_vocabulary_next_review_date", column: "next_review_date" },
    ];

    for (const idx of indexesToAdd) {
      if (!existingIndexes.includes(idx.name)) {
        console.log(`📝 Creating index: ${idx.name}...`);
        await sequelize.query(`
          CREATE INDEX ${idx.name} ON vocabulary (${idx.column})
        `);
        console.log(`✅ Index ${idx.name} created`);
      } else {
        console.log(`⏭️ Index ${idx.name} already exists, skipping`);
      }
    }

    // 4. Verify
    const [finalColumns] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'vocabulary'
      ORDER BY ordinal_position
    `);

    console.log("\n📋 Final columns:");
    finalColumns.forEach((c) => {
      console.log(`   ${c.column_name} (${c.data_type})`);
    });

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

addVocabularyColumns();
