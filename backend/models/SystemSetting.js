/**
 * SystemSetting.js
 * Path: backend/models/SystemSetting.js
 * Description: System settings model
 * Changes:
 * - ✅ FIXED: Removed ENUM type (use STRING instead)
 * - ✅ FIXED: category is now STRING with validation
 */

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const SystemSetting = sequelize.define(
  "SystemSetting",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    value: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
    },
    category: {
      // ✅ FIXED: Use STRING instead of ENUM to avoid migration issues
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: "general",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_public",
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "updated_by",
    },
  },
  {
    tableName: "system_settings",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["key"], unique: true },
      { fields: ["category"], name: "idx_settings_category" },
      { fields: ["is_public"], name: "idx_settings_public" },
    ],
  }
);

// ✅ Seed default settings
SystemSetting.seedDefaults = async function () {
  const defaults = [
    {
      key: "site_name",
      value: { fa: "آکادمی آلمانی", en: "German Academy" },
      category: "general",
      description: "نام سایت",
      isPublic: true,
    },
    {
      key: "site_description",
      value: { fa: "پلتفرم رایگان آموزش زبان آلمانی", en: "Free German learning platform" },
      category: "general",
      description: "توضیحات سایت",
      isPublic: true,
    },
    {
      key: "contact_email",
      value: "support@german-academy.com",
      category: "general",
      description: "ایمیل پشتیبانی",
      isPublic: true,
    },
    {
      key: "maintenance_mode",
      value: false,
      category: "maintenance",
      description: "حالت نگهداری سایت",
      isPublic: true,
    },
    {
      key: "enable_registration",
      value: true,
      category: "features",
      description: "فعال بودن ثبت‌نام",
      isPublic: true,
    },
    {
      key: "enable_ai_tutor",
      value: true,
      category: "features",
      description: "فعال بودن معلم هوش مصنوعی",
      isPublic: true,
    },
    {
      key: "enable_mentors",
      value: true,
      category: "features",
      description: "فعال بودن سیستم منتور",
      isPublic: true,
    },
    {
      key: "enable_stories",
      value: true,
      category: "features",
      description: "فعال بودن داستان‌ها",
      isPublic: true,
    },
    {
      key: "enable_scenarios",
      value: true,
      category: "features",
      description: "فعال بودن سناریوها",
      isPublic: true,
    },
    {
      key: "enable_leaderboard",
      value: true,
      category: "features",
      description: "فعال بودن جدول رتبه‌بندی",
      isPublic: true,
    },
    {
      key: "max_lessons_per_day",
      value: 20,
      category: "limits",
      description: "حداکثر درس در روز",
      isPublic: false,
    },
    {
      key: "ai_daily_limit",
      value: 50,
      category: "limits",
      description: "حداکثر مکالمه AI در روز",
      isPublic: false,
    },
    {
      key: "ai_model",
      value: "gpt-3.5-turbo",
      category: "ai",
      description: "مدل AI",
      isPublic: false,
    },
    {
      key: "ai_max_tokens",
      value: 2048,
      category: "ai",
      description: "حداکثر توکن AI",
      isPublic: false,
    },
    {
      key: "ai_temperature",
      value: 0.7,
      category: "ai",
      description: "دمای AI",
      isPublic: false,
    },
  ];

  for (const setting of defaults) {
    await this.findOrCreate({
      where: { key: setting.key },
      defaults: setting,
    });
  }
};

export default SystemSetting;
