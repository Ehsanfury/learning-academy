/**
 * XPHistory.js
 * Path: backend/models/XPHistory.js
 * Description: XP history model for tracking XP changes
 * Changes:
 * - ✅ New model for tracking XP history
 * - ✅ Stores all XP transactions
 */

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const XPHistory = sequelize.define(
  "XPHistory",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: -1000,
        max: 10000,
      },
    },
    totalXP: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Total XP after this transaction",
    },
    source: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "Source of XP (lesson, exercise, achievement, etc.)",
    },
    sourceId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "ID of the source entity",
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: "Additional metadata about the transaction",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "xp_history",
    timestamps: false,
    underscored: true,
    indexes: [
      {
        fields: ["user_id"],
      },
      {
        fields: ["created_at"],
      },
      {
        fields: ["source"],
      },
    ],
  }
);

// ============================================
// 🔗 Associations
// ============================================

XPHistory.associate = (models) => {
  XPHistory.belongsTo(models.User, {
    foreignKey: "userId",
    as: "user",
  });
};

export default XPHistory;
