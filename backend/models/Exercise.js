/**
 * Exercise.js
 * Path: backend/models/Exercise.js
 * Description: Exercise model for storing exercise history
 * Changes:
 * - ✅ Added lessonId field for association
 */

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Exercise = sequelize.define(
  "Exercise",
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
      field: "user_id",
    },
    // ✅ NEW: Link to lesson
    lessonId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      field: "lesson_id",
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "mixed",
    },
    level: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "A1",
    },
    questions: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    answers: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: { min: 0, max: 100 },
    },
    passed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    xpEarned: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "xp_earned",
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      field: "completed_at",
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
    tableName: "exercises",
    timestamps: true,
    underscored: true,
  }
);

export default Exercise;
