/**
 * Vocabulary.js
 * Path: backend/models/Vocabulary.js
 * Description: Vocabulary model for words and phrases
 * Changes:
 * - ✅ FIXED: id type is UUID
 * - ✅ FIXED: lesson_id type is VARCHAR(50)
 */

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Vocabulary = sequelize.define(
  "Vocabulary",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    lessonId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "lesson_id",
    },
    de: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    fa: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    en: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    level: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: "A1",
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "general",
    },
    partOfSpeech: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "other",
      field: "part_of_speech",
    },
    gender: {
      type: DataTypes.STRING(5),
      allowNull: true,
      defaultValue: "",
    },
    plural: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: "",
    },
    pronunciation: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: "",
    },
    example: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    audioUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null,
      field: "audio_url",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
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
    tableName: "vocabulary",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["de"],
      },
      {
        fields: ["lesson_id"],
      },
      {
        fields: ["level", "category"],
      },
    ],
  }
);

export default Vocabulary;
