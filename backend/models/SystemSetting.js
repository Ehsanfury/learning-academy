/**
 * SystemSetting.js
 * German Academy — تنظیمات سیستم قابل تغییر از پنل ادمین
 */

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const SystemSetting = sequelize.define(
  "SystemSetting",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
      type: DataTypes.ENUM(
        "general",
        "features",
        "limits",
        "ai",
        "email",
        "payment",
        "seo",
        "maintenance"
      ),
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
      { fields: ["category"], name: "idx_settings_category" },
      { fields: ["is_public"], name: "idx_settings_public" },
    ],
  }
);

// تنظیمات پیش‌فرض
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
    },
    {
      key: "enable_mentors",
      value: true,
      category: "features",
      description: "فعال بودن سیستم منتور",
    },
    {
      key: "enable_stories",
      value: true,
      category: "features",
      description: "فعال بودن داستان‌ها",
    },
    {
      key: "enable_scenarios",
      value: true,
      category: "features",
      description: "فعال بودن سناریوها",
    },
    {
      key: "enable_leaderboard",
      value: true,
      category: "features",
      description: "فعال بودن جدول رتبه‌بندی",
    },
    {
      key: "max_lessons_per_day",
      value: 20,
      category: "limits",
      description: "حداکثر درس در روز",
    },
    {
      key: "ai_daily_limit",
      value: 50,
      category: "limits",
      description: "حداکثر مکالمه AI در روز",
    },
    {
      key: "ai_model",
      value: "gpt-3.5-turbo",
      category: "ai",
      description: "مدل AI",
    },
    {
      key: "ai_max_tokens",
      value: 2048,
      category: "ai",
      description: "حداکثر توکن AI",
    },
    {
      key: "ai_temperature",
      value: 0.7,
      category: "ai",
      description: "دمای AI",
    },
    {
      key: "contact_email",
      value: "support@german-academy.com",
      category: "general",
      description: "ایمیل پشتیبانی",
      isPublic: true,
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
