/**
 * UserNotification.js
 * German Academy
// TODO: Translate - TODO: Translate - * مدل ارتباط کاربر و نوتیفیکیشن‌ها
 */

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const UserNotification = sequelize.define(
  "UserNotification",
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
    notificationId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "notification_id",
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_read",
    },
    isDismissed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_dismissed",
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "read_at",
    },
    dismissedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "dismissed_at",
    },
    clickedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "clicked_at",
    },
  },
  {
    tableName: "user_notifications",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["user_id", "notification_id"],
        name: "unique_user_notification",
      },
      {
        fields: ["user_id", "is_read"],
        name: "idx_user_notifications_read",
      },
      {
        fields: ["user_id", "is_dismissed"],
        name: "idx_user_notifications_dismissed",
      },
    ],
  },
);

export default UserNotification;
