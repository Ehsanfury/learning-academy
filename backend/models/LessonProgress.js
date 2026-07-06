/**
 * LessonProgress.js
 * German Academy
 * User lesson progress model
 */

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const LessonProgress = sequelize.define(
  "LessonProgress",
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
    lessonId: {
      type: DataTypes.STRING(50), // ✅ هماهنگ با Lesson.id که STRING(50) است
      allowNull: false,
      field: "lesson_id",
    },
    status: {
      type: DataTypes.ENUM,
      values: ["not_started", "in_progress", "completed", "perfect"],
      defaultValue: "not_started",
    },
    score: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    xpEarned: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "xp_earned",
      validate: {
        min: 0,
      },
    },
    answers: {
      type: DataTypes.JSONB,
      defaultValue: {},
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "started_at",
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "completed_at",
    },
    lastAttemptAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_attempt_at",
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "lesson_progress",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "lesson_id"],
        name: "unique_user_lesson_progress",
      },
      {
        fields: ["user_id"],
        name: "idx_lesson_progress_user",
      },
      {
        fields: ["lesson_id"],
        name: "idx_lesson_progress_lesson",
      },
      {
        fields: ["status"],
        name: "idx_lesson_progress_status",
      },
      {
        fields: ["user_id", "status"],
        name: "idx_lesson_progress_user_status",
      },
    ],
    hooks: {
      beforeCreate: (progress) => {
        if (progress.status === "in_progress" && !progress.startedAt) {
          progress.startedAt = new Date();
        }
        if (
          (progress.status === "completed" || progress.status === "perfect") &&
          !progress.completedAt
        ) {
          progress.completedAt = new Date();
        }
        progress.lastAttemptAt = new Date();
      },
      beforeUpdate: (progress) => {
        if (progress.changed("status")) {
          if (progress.status === "in_progress" && !progress.startedAt) {
            progress.startedAt = new Date();
          }
          if (
            (progress.status === "completed" || progress.status === "perfect") &&
            !progress.completedAt
          ) {
            progress.completedAt = new Date();
          }
        }
        progress.lastAttemptAt = new Date();
      },
    },
  }
);

export default LessonProgress;
