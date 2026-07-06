/**
 * Story.js
 * Path: backend/models/Story.js
 * Description: Story model for interactive stories
 * Changes:
 * - ✅ FIXED: Added proper JSONB defaults
 * - ✅ FIXED: Added indexes for performance
 */

import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../config/db.js";

const Story = sequelize.define(
  "Story",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    level: {
      type: DataTypes.STRING(5),
      allowNull: false,
      defaultValue: "A1",
    },
    title: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: Sequelize.literal("'{}'::jsonb"),
    },
    description: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: Sequelize.literal("'{}'::jsonb"),
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "📖",
    },
    paragraphs: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: Sequelize.literal("'[]'::jsonb"),
    },
    quiz: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: Sequelize.literal("'[]'::jsonb"),
    },
    xpReward: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 30,
    },
    estimatedMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 5,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "stories",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["level"],
        name: "idx_stories_level",
      },
      {
        fields: ["is_active"],
        name: "idx_stories_active",
      },
    ],
  }
);

export default Story;
