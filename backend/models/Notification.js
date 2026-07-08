/**
 * Notification.js
 * Path: backend/models/Notification.js
 * Description: Notification model for system notifications
 * Changes:
 * - ✅ FIXED: Added proper JSONB defaults
 * - ✅ FIXED: Added indexes for performance
 */

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Notification = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: { fa: "", en: "", de: "" },
    },
    message: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: { fa: "", en: "", de: "" },
    },
    type: {
      type: DataTypes.ENUM("info", "warning", "success", "promotion", "system"),
      allowNull: false,
      defaultValue: "info",
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    link: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    isGlobal: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isPromotion: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    clickCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    viewCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    targetUsers: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: true,
      defaultValue: [],
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "notifications",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["type"],
      },
      {
        fields: ["is_active"],
      },
      {
        fields: ["created_at"],
      },
      {
        fields: ["expires_at"],
      },
    ],
  }
);

export default Notification;
