/**
 * Story.js
 * Path: backend/models/Story.js
 * Description: Story model for interactive stories
 * Changes:
 * - ✅ FIXED: ID type changed to STRING for custom IDs
 */

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Story = sequelize.define(
  "Story",
  {
    id: {
      type: DataTypes.STRING(50),
      primaryKey: true,
      allowNull: false,
    },
    level: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "A1",
    },
    title: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    description: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "📖",
    },
    paragraphs: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    quiz: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    xpReward: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
      field: "xp_reward",
    },
    estimatedMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
      field: "estimated_minutes",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "is_active",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "updated_at",
    },
  },
  {
    tableName: "stories",
    timestamps: true,
    underscored: true,
  }
);

export default Story;
