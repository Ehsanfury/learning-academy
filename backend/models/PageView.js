/**
 * PageView.js
 * German Academy — ردیابی بازدید صفحات سایت
 */

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const PageView = sequelize.define(
  "PageView",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "user_id",
    },
    path: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    method: {
      type: DataTypes.STRING(10),
      defaultValue: "GET",
    },
    statusCode: {
      type: DataTypes.INTEGER,
      defaultValue: 200,
      field: "status_code",
    },
    responseTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "response_time",
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: "ip_address",
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "user_agent",
    },
    referer: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    device: {
      type: DataTypes.ENUM("desktop", "tablet", "mobile", "other"),
      allowNull: true,
    },
    browser: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    sessionId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "session_id",
    },
  },
  {
    tableName: "page_views",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: false,
    indexes: [
      { fields: ["user_id"], name: "idx_page_views_user" },
      { fields: ["path"], name: "idx_page_views_path" },
      { fields: ["created_at"], name: "idx_page_views_created" },
      { fields: ["ip_address"], name: "idx_page_views_ip" },
      { fields: ["session_id"], name: "idx_page_views_session" },
    ],
  }
);

export default PageView;
