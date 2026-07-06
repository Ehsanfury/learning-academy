// backend/scripts/fix-order.js
import sequelize from "../config/db.js";

async function fixOrder() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to database");

    const updates = [
      { id: "a1-l01", order: 1 },
      { id: "a1-l02", order: 2 },
      { id: "a1-l03", order: 3 },
      { id: "a1-l04", order: 4 },
      { id: "a1-l05", order: 5 },
      { id: "a1-l06", order: 6 },
      { id: "a1-l07", order: 7 },
      { id: "a1-l08", order: 8 },
      { id: "a1-l09", order: 9 },
      { id: "a1-l10", order: 10 },
      { id: "a1-l11", order: 11 },
      { id: "a1-l12", order: 12 },
    ];

    for (const { id, order } of updates) {
      await sequelize.query(
        `UPDATE lessons SET "order" = ${order} WHERE id = '${id}'`,
      );
      console.log(`  ✅ ${id} → order ${order}`);
    }

    const [result] = await sequelize.query(
      `SELECT id, "order" FROM lessons WHERE id LIKE 'a1-l%' ORDER BY "order" LIMIT 12`,
    );
    console.log("\n📊 Final orders:");
    result.forEach((row) => {
      console.log(`  ${row.id}: order ${row.order}`);
    });

    console.log("\n✅ Orders updated successfully");
    await sequelize.close();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

fixOrder();
