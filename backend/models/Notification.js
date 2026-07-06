/**
 * Notification.js
 * German Academy
 Notifications and promotions model
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
      defaultValue: {
        fa: "",
        en: "",
        de: "",
      },
    },
    message: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        fa: "",
        en: "",
        de: "",
      },
    },
    type: {
      type: DataTypes.ENUM("info", "warning", "success", "promotion", "system"),
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
      defaultValue: false,
      field: "is_global",
    },
    isPromotion: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_promotion",
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "expires_at",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active",
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    clickCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "click_count",
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "view_count",
    },
    targetUsers: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: [],
      field: "target_users",
    },
  },
  {
    tableName: "notifications",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["is_active"],
        name: "idx_notifications_active",
      },
      {
        fields: ["type"],
        name: "idx_notifications_type",
      },
      {
        fields: ["expires_at"],
        name: "idx_notifications_expires",
      },
      {
        fields: ["is_promotion"],
        name: "idx_notifications_promotion",
      },
    ],
  },
);

export default Notification;
