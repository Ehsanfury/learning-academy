/**
 * AIConversation.js
 * German Academy
 * AI Conversations model
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
      allowNull: true,
      defaultValue: "default",
      field: "session_id",
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    sender: {
      type: DataTypes.ENUM,
      values: ["user", "assistant", "system"],
      allowNull: false,
    },

    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

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
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    underscored: false,
    freezeTableName: true,
    indexes: [
      {
        fields: ["user_id", "session_id"],
        name: "idx_ai_conversations_user_session",
      },
      {
        fields: ["user_id"],
        name: "idx_ai_conversations_user",
      },
      {
        fields: ["session_id"],
        name: "idx_ai_conversations_session",
      },
    ],
  }
);

export default AIConversation;
