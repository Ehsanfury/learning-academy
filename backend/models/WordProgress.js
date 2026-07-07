/**
 * WordProgress.js
 * Path: backend/models/WordProgress.js
 * Description: Word progress model for spaced repetition (SM-2 algorithm)
 * Changes:
 * - ✅ FIXED: wordId type changed from UUID to STRING(50) to match Vocabulary.id
 * - ✅ FIXED: Foreign key properly defined
 */

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const WordProgress = sequelize.define(
  "WordProgress",
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
    wordId: {
      type: DataTypes.STRING(50), // ✅ STRING(50) - matches Vocabulary.id
      allowNull: false,
      field: "word_id",
    },
    easeFactor: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 2.5,
      field: "ease_factor",
    },
    interval: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    repetitions: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    lastQuality: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "last_quality",
    },
    lastReviewDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_review_date",
    },
    nextReviewDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "next_review_date",
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
    tableName: "word_progress",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["user_id", "word_id"],
        unique: true,
      },
      {
        fields: ["user_id", "next_review_date"],
      },
    ],
  }
);

export default WordProgress;
