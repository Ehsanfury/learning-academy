/**
 * Achievement.js
 * German Academy
 * Achievements model - defines achievement types and conditions
 */

import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Achievement = sequelize.define(
  "Achievement",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    // Achievement name (e.g., "First Lesson Completed")
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },

    // Display title (e.g., "Start Learning")
    title: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        fa: "دستاورد جدید",
        en: "New Achievement",
        de: "Neue Errungenschaft",
      },
    },

    // Full description (e.g., "Complete your first lesson")
    description: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        fa: "توضیح دستاورد",
        en: "Achievement description",
        de: "Beschreibung der Errungenschaft",
      },
    },

    // Icon name (from lucide-react)
    icon: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "Award",
    },

    // Achievement color (for display)
    color: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "#6366f1",
    },

    // Achievement category
    category: {
      type: DataTypes.ENUM,
      values: [
        "learning", // Learning achievements
        "streak", // Streak achievements
        "vocabulary", // Vocabulary achievements
        "xp", // XP achievements
        "social", // Social achievements
        "special", // Special achievements
        "milestone", // Milestone achievements
      ],
      allowNull: false,
      defaultValue: "learning",
    },

    // Achievement tier (bronze, silver, gold, diamond)
    tier: {
      type: DataTypes.ENUM,
      values: ["bronze", "silver", "gold", "diamond"],
      defaultValue: "bronze",
    },

    // XP reward for earning this achievement
    xpReward: {
      type: DataTypes.INTEGER,
      defaultValue: 50,
      field: "xp_reward",
      validate: {
        min: 0,
      },
    },

    // Condition for earning (as JSON)
    // Example: { type: "lessons_completed", target: 1 }
    condition: {
      type: DataTypes.JSONB,
      allowNull: false,
    },

    // Total number of users who earned this achievement
    totalEarned: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "total_earned",
    },

    // Is this achievement active?
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active",
    },

    // Display order (for sorting)
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: "display_order",
    },
  },
  {
    tableName: "achievements",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ["category"],
        name: "idx_achievement_category",
      },
      {
        fields: ["is_active"],
        name: "idx_achievement_active",
      },
    ],
  }
);

// ============================================
// 📚 Static Methods
// ============================================

/**
 * Find achievement by name
 */
Achievement.findByName = async function (name) {
  return this.findOne({ where: { name } });
};

/**
 * Get all active achievements
 */
Achievement.findActive = async function () {
  return this.findAll({
    where: { isActive: true },
    order: [["displayOrder", "ASC"]],
  });
};

/**
 * Get achievements by category
 */
Achievement.findByCategory = async function (category) {
  return this.findAll({
    where: {
      category,
      isActive: true,
    },
    order: [["tier", "ASC"]],
  });
};

/**
 * Seed default achievements
 */
Achievement.seedDefaults = async function () {
  const defaults = [
    {
      name: "first_lesson",
      title: { fa: "شروع یادگیری", en: "First Steps", de: "Erste Schritte" },
      description: {
        fa: "اولین درس خود را کامل کنید",
        en: "Complete your first lesson",
        de: "Schließe deine erste Lektion ab",
      },
      icon: "BookOpen",
      color: "#22c55e",
      category: "learning",
      tier: "bronze",
      xpReward: 25,
      condition: { type: "lessons_completed", target: 1 },
    },
    {
      name: "lesson_master_10",
      title: {
        fa: "دانش‌آموز درس‌ها",
        en: "Lesson Learner",
        de: "Lektionslerner",
      },
      description: {
        fa: "۱۰ درس را کامل کنید",
        en: "Complete 10 lessons",
        de: "Schließe 10 Lektionen ab",
      },
      icon: "GraduationCap",
      color: "#3b82f6",
      category: "learning",
      tier: "silver",
      xpReward: 100,
      condition: { type: "lessons_completed", target: 10 },
    },
    {
      name: "streak_7",
      title: { fa: "گل‌زنی ۷ روزه", en: "7-Day Streak", de: "7-Tage-Serie" },
      description: {
        fa: "۷ روز متوالی یادگیری",
        en: "7 days of consecutive learning",
        de: "7 Tage am Stück gelernt",
      },
      icon: "Flame",
      color: "#f59e0b",
      category: "streak",
      tier: "silver",
      xpReward: 75,
      condition: { type: "streak", target: 7 },
    },
    {
      name: "streak_30",
      title: { fa: "گل‌زنی ۳۰ روزه", en: "30-Day Streak", de: "30-Tage-Serie" },
      description: {
        fa: "۳۰ روز متوالی یادگیری",
        en: "30 days of consecutive learning",
        de: "30 Tage am Stück gelernt",
      },
      icon: "Flame",
      color: "#ef4444",
      category: "streak",
      tier: "gold",
      xpReward: 200,
      condition: { type: "streak", target: 30 },
    },
    {
      name: "vocabulary_50",
      title: {
        fa: "واژه‌شناس",
        en: "Vocabulary Builder",
        de: "Wortschatz-Baumeister",
      },
      description: {
        fa: "۵۰ کلمه جدید یاد بگیرید",
        en: "Learn 50 new words",
        de: "Lerne 50 neue Wörter",
      },
      icon: "Languages",
      color: "#8b5cf6",
      category: "vocabulary",
      tier: "silver",
      xpReward: 100,
      condition: { type: "words_learned", target: 50 },
    },
    {
      name: "xp_1000",
      title: {
        fa: "جمع‌آوری امتیاز",
        en: "Point Collector",
        de: "Punktesammler",
      },
      description: {
        fa: "۱۰۰۰ امتیاز XP جمع‌آوری کنید",
        en: "Collect 1000 XP",
        de: "Sammle 1000 XP",
      },
      icon: "Star",
      color: "#f472b6",
      category: "xp",
      tier: "gold",
      xpReward: 150,
      condition: { type: "total_xp", target: 1000 },
    },
    {
      name: "perfect_lesson",
      title: { fa: "درس عالی", en: "Perfect Lesson", de: "Perfekte Lektion" },
      description: {
        fa: "یک درس را با نمره کامل به اتمام برسانید",
        en: "Complete a lesson with perfect score",
        de: "Schließe eine Lektion mit perfekter Punktzahl ab",
      },
      icon: "Trophy",
      color: "#eab308",
      category: "learning",
      tier: "gold",
      xpReward: 150,
      condition: { type: "perfect_lessons", target: 1 },
    },
    {
      name: "ai_conversation_10",
      title: {
        fa: "گفتگو با هوش مصنوعی",
        en: "AI Conversationalist",
        de: "KI-Gesprächspartner",
      },
      description: {
        fa: "۱۰ مکالمه با هوش مصنوعی انجام دهید",
        en: "Have 10 conversations with AI",
        de: "Führe 10 Gespräche mit der KI",
      },
      icon: "Bot",
      color: "#06b6d4",
      category: "special",
      tier: "silver",
      xpReward: 100,
      condition: { type: "ai_conversations", target: 10 },
    },
  ];

  for (const achievement of defaults) {
    const [instance, created] = await this.findOrCreate({
      where: { name: achievement.name },
      defaults: achievement,
    });

    if (created) {
      console.log(`✅ Achievement seeded: ${achievement.name}`);
    }
  }
};

export default Achievement;
