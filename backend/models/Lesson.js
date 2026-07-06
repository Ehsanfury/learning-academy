/**
 * Lesson.js
 * Path: backend/models/Lesson.js
 * Description: Lesson model
 * Changes:
 * - ✅ FIXED: JSONB defaults use sequelize literal for PostgreSQL
 * - ✅ FIXED: lessonNumber allowNull: true
 */

import { DataTypes, Sequelize } from "sequelize";
import sequelize from "../config/db.js";

const Lesson = sequelize.define(
  "Lesson",
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
    unit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    lessonNumber: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      field: "lesson_number",
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
    version: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "1.0.0",
    },
    status: {
      type: DataTypes.ENUM("draft", "published", "archived"),
      allowNull: true,
      defaultValue: "published",
    },
    lastUpdated: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      field: "last_updated",
    },
    estimatedTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 30,
      field: "estimated_time",
    },
    difficulty: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    prerequisites: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: Sequelize.literal("'[]'::jsonb"), // ✅ FIXED
    },
    nextLessonId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      field: "next_lesson_id",
    },
    previousLessonId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      field: "previous_lesson_id",
    },
    title: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: Sequelize.literal("'{}'::jsonb"), // ✅ FIXED
    },
    shortTitle: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: Sequelize.literal("'{}'::jsonb"),
      field: "short_title",
    },
    description: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: Sequelize.literal("'{}'::jsonb"),
    },
    learningObjectives: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: Sequelize.literal("'{}'::jsonb"),
      field: "learning_objectives",
    },
    xpReward: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 50,
      field: "xp_reward",
    },
    perfectBonusXP: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 25,
      field: "perfect_bonus_xp",
    },
    completionBonusXP: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 10,
      field: "completion_bonus_xp",
    },
    cefr: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: "A1",
    },
    goetheChapter: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null,
      field: "goethe_chapter",
    },
    tags: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: Sequelize.literal("'[]'::jsonb"), // ✅ FIXED
    },
    skills: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: Sequelize.literal("'[]'::jsonb"), // ✅ FIXED
    },
    examRelevance: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: Sequelize.literal("'{}'::jsonb"),
      field: "exam_relevance",
    },
    sections: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: Sequelize.literal("'[]'::jsonb"), // ✅ FIXED
    },
    totalSections: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: "total_sections",
    },
    totalQuestions: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: "total_questions",
    },
    totalVocabulary: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      field: "total_vocabulary",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
      field: "is_active",
    },
    exportable: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
      field: "updated_at",
    },
  },
  {
    tableName: "lessons",
    timestamps: true,
    underscored: true,
  }
);

export default Lesson;
