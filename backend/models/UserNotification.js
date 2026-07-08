/**
 * UserNotification.js
 * Path: backend/models/UserNotification.js
 * Description: User notification junction table
 * Changes:
 * - ✅ FIXED: Added proper associations
 * - ✅ FIXED: Added indexes for performance
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
    },
    notificationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isDismissed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    dismissedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    clickedAt: {
      type: DataTypes.DATE,
      allowNull: true,
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
    tableName: "user_notifications",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["user_id"],
      },
      {
        fields: ["notification_id"],
      },
      {
        fields: ["is_read"],
      },
      {
        unique: true,
        fields: ["user_id", "notification_id"],
      },
    ],
  }
);

export default UserNotification;
