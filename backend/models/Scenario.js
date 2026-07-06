/**
 * Scenario.js
 * Path: backend/models/Scenario.js
 * Description: Scenario model for interactive scenarios
 */

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Scenario = sequelize.define(
  "Scenario",
  {
    id: {
      type: DataTypes.STRING(50), // ✅ STRING, NOT UUID
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
      defaultValue: "🎭",
    },
    startMessage: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      field: "start_message",
    },
    steps: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    xpReward: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 50,
      field: "xp_reward",
    },
    estimatedMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 15,
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
    tableName: "scenarios",
    timestamps: true,
    underscored: true,
  }
);

export default Scenario;
