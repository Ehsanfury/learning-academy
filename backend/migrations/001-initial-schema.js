/**
 * 001-initial-schema.js
 * Path: backend/migrations/001-initial-schema.js
 * Description: Initial database schema migration
 * Changes:
 * - ✅ FIXED: Using proper column types
 * - ✅ FIXED: No default value for enum columns
 */

import { DataTypes } from "sequelize";

export default {
  up: async (queryInterface, Sequelize) => {
    // ============================================
    // 1. Create Users table
    // ============================================
    await queryInterface.createTable("Users", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
      },
      role: {
        type: DataTypes.ENUM("user", "admin"),
        defaultValue: "user",
      },
      xp: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      level: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      streak: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      longestStreak: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      lastActiveDate: {
        type: DataTypes.DATE,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      verificationToken: {
        type: DataTypes.STRING,
      },
      resetPasswordToken: {
        type: DataTypes.STRING,
      },
      resetPasswordExpires: {
        type: DataTypes.DATE,
      },
      language: {
        type: DataTypes.STRING,
        defaultValue: "fa",
      },
      theme: {
        type: DataTypes.STRING,
        defaultValue: "light",
      },
      nativeLanguage: {
        type: DataTypes.STRING,
        defaultValue: "fa",
      },
      learningGoal: {
        type: DataTypes.STRING,
        defaultValue: "general",
      },
      dailyGoal: {
        type: DataTypes.INTEGER,
        defaultValue: 50,
      },
      notifications: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      soundEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      streakReminder: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      autoPlayAudio: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    // ============================================
    // 2. Create Lessons table
    // ============================================
    await queryInterface.createTable("Lessons", {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      title: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      subtitle: {
        type: DataTypes.JSONB,
      },
      level: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      unit: {
        type: DataTypes.INTEGER,
      },
      order: {
        type: DataTypes.INTEGER,
      },
      lessonNumber: {
        type: DataTypes.INTEGER,
      },
      estimatedMinutes: {
        type: DataTypes.INTEGER,
        defaultValue: 20,
      },
      xpReward: {
        type: DataTypes.INTEGER,
        defaultValue: 50,
      },
      perfectBonusXP: {
        type: DataTypes.INTEGER,
        defaultValue: 25,
      },
      totalSections: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      totalVocabulary: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      sections: {
        type: DataTypes.JSONB,
        defaultValue: [],
      },
      status: {
        type: DataTypes.ENUM("draft", "published", "archived"),
        defaultValue: "draft",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    // ============================================
    // 3. Create LessonProgress table
    // ============================================
    await queryInterface.createTable("LessonProgresses", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      lessonId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "Lessons",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      status: {
        type: DataTypes.ENUM("not_started", "in_progress", "completed", "perfect"),
        defaultValue: "not_started",
      },
      score: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      xpEarned: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      answers: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      timeSpent: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      completedAt: {
        type: DataTypes.DATE,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    // ============================================
    // 4. Create UserRefreshTokens table
    // ============================================
    await queryInterface.createTable("UserRefreshTokens", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      isRevoked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      revokedAt: {
        type: DataTypes.DATE,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    // ============================================
    // 5. Create SystemSettings table (FIXED)
    // ============================================
    await queryInterface.createTable("SystemSettings", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      value: {
        type: DataTypes.JSONB,
        defaultValue: {},
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING,
        defaultValue: "general",
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING,
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    // ============================================
    // 6. Create Vocabulary table
    // ============================================
    await queryInterface.createTable("Vocabularies", {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      de: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      fa: {
        type: DataTypes.STRING,
      },
      en: {
        type: DataTypes.STRING,
      },
      ipa: {
        type: DataTypes.STRING,
      },
      article: {
        type: DataTypes.STRING,
      },
      level: {
        type: DataTypes.STRING,
        defaultValue: "A1",
      },
      category: {
        type: DataTypes.STRING,
      },
      example: {
        type: DataTypes.JSONB,
      },
      usageNotes: {
        type: DataTypes.JSONB,
      },
      commonMistakes: {
        type: DataTypes.JSONB,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    // ============================================
    // 7. Create WordProgress table
    // ============================================
    await queryInterface.createTable("WordProgresses", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      wordId: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "Vocabularies",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      easeFactor: {
        type: DataTypes.FLOAT,
        defaultValue: 2.5,
      },
      interval: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      repetitions: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      lastReviewDate: {
        type: DataTypes.DATE,
      },
      nextReviewDate: {
        type: DataTypes.DATE,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    // ============================================
    // 8. Create Achievements table
    // ============================================
    await queryInterface.createTable("Achievements", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      title: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      description: {
        type: DataTypes.JSONB,
      },
      icon: {
        type: DataTypes.STRING,
        defaultValue: "🏆",
      },
      color: {
        type: DataTypes.STRING,
        defaultValue: "#6366f1",
      },
      tier: {
        type: DataTypes.STRING,
        defaultValue: "bronze",
      },
      category: {
        type: DataTypes.STRING,
        defaultValue: "learning",
      },
      xpReward: {
        type: DataTypes.INTEGER,
        defaultValue: 50,
      },
      criteria: {
        type: DataTypes.JSONB,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    // ============================================
    // 9. Create UserAchievements table
    // ============================================
    await queryInterface.createTable("UserAchievements", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      achievementId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Achievements",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      earnedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      isViewed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    // ============================================
    // 10. Create XPHistory table
    // ============================================
    await queryInterface.createTable("XPHistories", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      totalXP: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      source: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sourceId: {
        type: DataTypes.STRING,
      },
      metadata: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    // ============================================
    // 11. Create Indexes
    // ============================================
    await queryInterface.addIndex("Users", ["email"]);
    await queryInterface.addIndex("Users", ["username"]);
    await queryInterface.addIndex("Users", ["role"]);
    await queryInterface.addIndex("Lessons", ["level"]);
    await queryInterface.addIndex("Lessons", ["status"]);
    await queryInterface.addIndex("LessonProgresses", ["userId"]);
    await queryInterface.addIndex("LessonProgresses", ["lessonId"]);
    await queryInterface.addIndex("LessonProgresses", ["status"]);
    await queryInterface.addIndex("UserRefreshTokens", ["userId"]);
    await queryInterface.addIndex("UserRefreshTokens", ["token"]);
    await queryInterface.addIndex("Vocabularies", ["de"]);
    await queryInterface.addIndex("Vocabularies", ["level"]);
    await queryInterface.addIndex("WordProgresses", ["userId"]);
    await queryInterface.addIndex("WordProgresses", ["wordId"]);
    await queryInterface.addIndex("Achievements", ["name"]);
    await queryInterface.addIndex("UserAchievements", ["userId"]);
    await queryInterface.addIndex("XPHistories", ["userId"]);
    await queryInterface.addIndex("XPHistories", ["source"]);

    // ============================================
    // 12. Create default admin user
    // ============================================
    await queryInterface.bulkInsert("Users", [
      {
        id: "11111111-1111-1111-1111-111111111111",
        email: "admin@german-academy.com",
        password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY9t8h6GjF8vjW2",
        name: "Admin",
        username: "admin",
        role: "admin",
        xp: 1000,
        level: 5,
        streak: 0,
        emailVerified: true,
        isActive: true,
        language: "fa",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // ============================================
    // 13. Seed default system settings
    // ============================================
    await queryInterface.bulkInsert("SystemSettings", [
      {
        id: "11111111-1111-1111-1111-111111111112",
        key: "site_name",
        value: JSON.stringify({ fa: "آکادمی آلمانی", en: "German Academy" }),
        category: "general",
        description: "نام سایت",
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "11111111-1111-1111-1111-111111111113",
        key: "site_description",
        value: JSON.stringify({
          fa: "پلتفرم رایگان آموزش زبان آلمانی",
          en: "Free German learning platform",
        }),
        category: "general",
        description: "توضیحات سایت",
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "11111111-1111-1111-1111-111111111114",
        key: "contact_email",
        value: '"support@german-academy.com"',
        category: "general",
        description: "ایمیل پشتیبانی",
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "11111111-1111-1111-1111-111111111115",
        key: "maintenance_mode",
        value: "false",
        category: "maintenance",
        description: "حالت نگهداری سایت",
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "11111111-1111-1111-1111-111111111116",
        key: "max_lessons_per_day",
        value: "20",
        category: "limits",
        description: "حداکثر درس در روز",
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "11111111-1111-1111-1111-111111111117",
        key: "ai_model",
        value: '"gpt-3.5-turbo"',
        category: "ai",
        description: "مدل AI",
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "11111111-1111-1111-1111-111111111118",
        key: "ai_max_tokens",
        value: "2048",
        category: "ai",
        description: "حداکثر توکن AI",
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "11111111-1111-1111-1111-111111111119",
        key: "ai_temperature",
        value: "0.7",
        category: "ai",
        description: "دمای AI",
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // ============================================
    // 14. Seed default achievements
    // ============================================
    await queryInterface.bulkInsert("Achievements", [
      {
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        name: "first_lesson",
        title: JSON.stringify({ fa: "اولین قدم", en: "First Step" }),
        description: JSON.stringify({
          fa: "اولین درس خود را کامل کنید",
          en: "Complete your first lesson",
        }),
        icon: "🌟",
        color: "#6366f1",
        tier: "bronze",
        category: "learning",
        xpReward: 50,
        criteria: JSON.stringify({ type: "lesson_completed", count: 1 }),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        name: "five_lessons",
        title: JSON.stringify({ fa: "پنج درس", en: "Five Lessons" }),
        description: JSON.stringify({ fa: "۵ درس را کامل کنید", en: "Complete 5 lessons" }),
        icon: "📚",
        color: "#22c55e",
        tier: "bronze",
        category: "learning",
        xpReward: 100,
        criteria: JSON.stringify({ type: "lesson_completed", count: 5 }),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
        name: "ten_lessons",
        title: JSON.stringify({ fa: "ده درس", en: "Ten Lessons" }),
        description: JSON.stringify({ fa: "۱۰ درس را کامل کنید", en: "Complete 10 lessons" }),
        icon: "🎓",
        color: "#eab308",
        tier: "silver",
        category: "learning",
        xpReward: 200,
        criteria: JSON.stringify({ type: "lesson_completed", count: 10 }),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
        name: "perfect_score",
        title: JSON.stringify({ fa: "نمره کامل", en: "Perfect Score" }),
        description: JSON.stringify({
          fa: "یک درس را با نمره ۱۰۰ کامل کنید",
          en: "Complete a lesson with 100% score",
        }),
        icon: "💯",
        color: "#f43f5e",
        tier: "gold",
        category: "learning",
        xpReward: 150,
        criteria: JSON.stringify({ type: "perfect_lesson", count: 1 }),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("UserAchievements");
    await queryInterface.dropTable("Achievements");
    await queryInterface.dropTable("XPHistories");
    await queryInterface.dropTable("WordProgresses");
    await queryInterface.dropTable("Vocabularies");
    await queryInterface.dropTable("SystemSettings");
    await queryInterface.dropTable("UserRefreshTokens");
    await queryInterface.dropTable("LessonProgresses");
    await queryInterface.dropTable("Lessons");
    await queryInterface.dropTable("Users");
  },
};
