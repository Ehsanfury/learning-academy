/**
 * StoryProgress.js
 * Path: backend/models/StoryProgress.js
 * Description: Story progress model
 * Changes:
 * - ✅ FIXED: storyId type changed from UUID to STRING(50) to match Story.id
 */

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const StoryProgress = sequelize.define(
  "StoryProgress",
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
    storyId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: "stories",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    progress: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "not_started",
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    xpEarned: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "story_progress",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["user_id"],
      },
      {
        fields: ["story_id"],
      },
      {
        unique: true,
        fields: ["user_id", "story_id"],
      },
    ],
  }
);

export default StoryProgress;
