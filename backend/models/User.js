/**
 * User.js
 * Path: backend/models/User.js
 * Description: User model with all fields
 * Version: 2.3 - Removed refreshToken (use UserRefreshToken model)
 *         - Removed duplicate streak/XP logic (use services)
 *         - Added database indexes
 */

import { DataTypes, Op } from "sequelize";
import sequelize from "../config/db.js";
import bcrypt from "bcryptjs";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { len: [2, 100], notEmpty: true },
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      validate: { len: [3, 100] },
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "first_name",
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: "last_name",
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true, notEmpty: true },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { notEmpty: true, len: [6, 255] },
    },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      allowNull: false,
      defaultValue: "user",
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    language: {
      type: DataTypes.STRING(10),
      defaultValue: "fa",
    },
    theme: {
      type: DataTypes.STRING(10),
      defaultValue: "light",
      allowNull: true,
    },
    nativeLanguage: {
      type: DataTypes.ENUM("fa", "en", "de", "ar", "tr", "ru"),
      defaultValue: "fa",
      field: "native_language",
    },
    learningGoal: {
      type: DataTypes.ENUM("migration", "exam", "ausbildung", "university", "work", "general"),
      defaultValue: "general",
      field: "learning_goal",
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: { min: 1 },
    },
    xp: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 },
    },
    streak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 },
    },
    longestStreak: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 },
      field: "longest_streak",
    },
    lastActiveDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
      field: "last_active_date",
    },
    dailyGoal: {
      type: DataTypes.INTEGER,
      defaultValue: 50,
      validate: { min: 1, max: 1000 },
      field: "daily_goal",
    },
    soundEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "sound_enabled",
    },
    notifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    streakReminder: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "streak_reminder",
    },
    autoPlayAudio: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "auto_play_audio",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active",
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "email_verified",
    },
    verificationToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      field: "verification_token",
    },
    resetPasswordToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
      field: "reset_password_token",
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      field: "reset_password_expires",
    },
    // ✅ REMOVED: refreshToken - use UserRefreshToken model instead
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      field: "last_login_at",
    },
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    underscored: true,
    paranoid: true,
    deletedAt: "deleted_at",
    indexes: [
      { fields: ["email"] },
      { fields: ["username"] },
      { fields: ["role"] },
      { fields: ["is_active"] },
      { fields: ["level"] },
      { fields: ["xp"] },
      { fields: ["streak"] },
      { fields: ["last_active_date"] },
      { fields: ["created_at"] },
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          const password = user.password;
          if (
            !password.startsWith("$2a$") &&
            !password.startsWith("$2b$") &&
            !password.startsWith("$2y$")
          ) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
          }
        }
      },
    },
  }
);

// ============================================
// 🔐 Instance Methods
// ============================================

User.prototype.comparePassword = async function (candidatePassword) {
  if (!candidatePassword || !this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toJSON = function () {
  const values = { ...this.get() };
  const sensitiveFields = [
    "password",
    "verification_token",
    "reset_password_token",
    "reset_password_expires",
  ];
  sensitiveFields.forEach((field) => delete values[field]);
  return values;
};

// ============================================
// 📚 Static Methods
// ============================================

User.findByVerificationToken = async function (token) {
  if (!token) return null;
  return this.findOne({ where: { verification_token: token } });
};

User.findByResetToken = async function (token) {
  if (!token) return null;
  return this.findOne({
    where: {
      reset_password_token: token,
      reset_password_expires: {
        [Op.gt]: new Date(),
      },
    },
  });
};

export default User;
