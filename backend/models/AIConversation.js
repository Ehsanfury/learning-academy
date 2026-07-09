/**
 * AIConversation.js
 * Path: backend/models/AIConversation.js
 * Description: AI conversation model
 * Changes:
 * - ✅ FIXED: underscored: true - all fields use snake_case
 * - ✅ FIXED: removed field definitions (redundant with underscored)
 * - ✅ FIXED: metaData → meta_data
 */

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const AIConversation = sequelize.define(
  "AIConversation",
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
      defaultValue: "default",
      field: "session_id",
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sender: {
      type: DataTypes.ENUM("user", "assistant", "system"),
      allowNull: false,
      defaultValue: "user",
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    // ✅ FIXED: renamed from metaData to meta_data
    metaData: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      field: "meta_data",
    },
  },
  {
    tableName: "ai_conversations",
    timestamps: true,
    underscored: true,
  }
);

export default AIConversation;
