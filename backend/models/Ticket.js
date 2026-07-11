/**
 * Ticket.js
 * Path: backend/models/Ticket.js
 * Version: 2.0 - Fixed enum issues
 */

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Ticket = sequelize.define(
  "Ticket",
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
    subject: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [3, 200],
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    category: {
      type: DataTypes.STRING(50),  // ✅ تغییر از ENUM به STRING
      defaultValue: "other",
      allowNull: false,
    },
    priority: {
      type: DataTypes.STRING(20),  // ✅ تغییر از ENUM به STRING
      defaultValue: "medium",
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),  // ✅ تغییر از ENUM به STRING
      defaultValue: "open",
      allowNull: false,
    },
    assignedTo: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "assigned_to",
    },
    adminReply: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "admin_reply",
    },
    adminRepliedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "admin_replied_at",
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "user_agent",
    },
    page: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 1, max: 5 },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active",
    },
  },
  {
    tableName: "tickets",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["user_id"], name: "idx_tickets_user" },
      { fields: ["status"], name: "idx_tickets_status" },
      { fields: ["priority"], name: "idx_tickets_priority" },
      { fields: ["category"], name: "idx_tickets_category" },
      { fields: ["assigned_to"], name: "idx_tickets_assigned" },
      { fields: ["created_at"], name: "idx_tickets_created" },
    ],
  }
);

export default Ticket;