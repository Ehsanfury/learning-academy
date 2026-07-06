/**
 * ScenarioSession.js
 * Path: backend/models/ScenarioSession.js
 * Description: Scenario session model for tracking scenario progress
 * Changes:
 * - 🆕 New file created to fix import error
 * - ✅ FIXED: Removed duplicate association (moved to index.js)
 * - ✅ FIXED: Proper field mapping with underscored: true
 */

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ScenarioSession = sequelize.define(
  "ScenarioSession",
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
    sessionId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "session_id",
    },
    scenarioId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "scenario_id",
    },
    status: {
      type: DataTypes.ENUM("in_progress", "completed", "abandoned"),
      allowNull: false,
      defaultValue: "in_progress",
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "started_at",
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      field: "completed_at",
    },
    xpEarned: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "xp_earned",
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
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
    tableName: "scenario_sessions",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["user_id", "session_id"],
        unique: true,
      },
      {
        fields: ["user_id", "status"],
      },
      {
        fields: ["scenario_id"],
      },
      {
        fields: ["user_id", "scenario_id"],
      },
    ],
  }
);

// ============================================
// 📤 Export
// ============================================

export default ScenarioSession;
