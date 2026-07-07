/**
 * AIConversation.js
 * Path: backend/models/AIConversation.js
 * Description: AI conversation model
 * Changes:
 * - ✅ FIXED: underscored: true - all fields use snake_case
 * - ✅ FIXED: removed field definitions (redundant with underscored)
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
    },
    sessionId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "default",
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
    metaData: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
  },
  {
    tableName: "ai_conversations",
    timestamps: true,
    underscored: true, // ✅ This automatically maps createdAt -> created_at
  }
);

export default AIConversation;
