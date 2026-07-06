/**
 * StoryProgress.js
 * Path: backend/models/StoryProgress.js
 * Description: Story progress model for tracking user progress
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
    storyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "stories",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    status: {
      type: DataTypes.STRING(20),
      defaultValue: "not_started",
      validate: {
        isIn: [["not_started", "in_progress", "completed"]],
      },
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    xpEarned: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "story_progress",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["user_id", "story_id"],
        unique: true,
      },
    ],
  }
);

export default StoryProgress;
