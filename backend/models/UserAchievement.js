/**
 * UserAchievement.js
 * Path: backend/models/UserAchievement.js
 * Description: User achievement model (junction table)
 * Changes:
 * - ✅ FIXED: Added missing columns
 * - ✅ FIXED: Added isEarned column
 * - ✅ FIXED: Proper associations with User and Achievement
 */

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const UserAchievement = sequelize.define(
  "UserAchievement",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    achievementId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "achievements",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    // ✅ NEW: isEarned column
    isEarned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    earnedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    // ✅ NEW: isViewed for tracking notification
    isViewed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    // ✅ NEW: progress for tracking achievement progress
    progress: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
  },
  {
    tableName: "user_achievements",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["user_id"],
      },
      {
        fields: ["achievement_id"],
      },
      {
        unique: true,
        fields: ["user_id", "achievement_id"],
      },
    ],
  }
);

export default UserAchievement;
