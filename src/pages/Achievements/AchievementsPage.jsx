/**
 * AchievementsPage.jsx
 * Path: src/pages/Achievements/AchievementsPage.jsx
 * Description: Achievements page with progress tracking
 * Changes:
 * - ✅ FIXED: Duplicate imports removed (Flame, Zap, Target)
 * - ✅ Cleaned up import list
 */

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@context/AuthContext";
import { useLanguageContext } from "@context/LanguageContext";
import api from "@services/api";
import debug from "../../utils/debug";
import {
  Trophy,
  Award,
  Star,
  Medal,
  Crown,
  Flame,
  BookOpen,
  CheckCircle,
  Lock,
  Loader2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  Users,
  MessageSquare,
  Mic,
  PenTool,
  Globe,
} from "lucide-react";
import toast from "react-hot-toast";

// ============================================
// 📊 Achievement Config
// ============================================

const ACHIEVEMENT_ICONS = {
  first_lesson: "🎯",
  streak_7: "🔥",
  streak_30: "🔥",
  streak_100: "💪",
  words_50: "📝",
  words_100: "📚",
  words_500: "🏆",
  words_1000: "🎓",
  lessons_10: "📖",
  lessons_50: "🎒",
  lessons_100: "🔬",
  perfect_lesson: "⭐",
  perfect_week: "👑",
  stories_5: "📕",
  scenarios_5: "🎭",
  ai_chat_10: "🤖",
  level_5: "⬆️",
  level_10: "🚀",
  quiz_master: "🏅",
  early_bird: "🌅",
  level_a1_complete: "🏆",
  level_a2_complete: "🏆",
};

const TIER_COLORS = {
  bronze: "from-amber-600 to-amber-800",
  silver: "from-gray-300 to-gray-500",
  gold: "from-yellow-400 to-yellow-600",
  diamond: "from-cyan-300 to-cyan-600",
};

const TIER_BADGE = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
  diamond: "💎",
};

// ============================================
// 📚 AchievementsPage Component
// ============================================

const AchievementsPage = () => {
  const { user } = useAuth();
  const { language } = useLanguageContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    earned: 0,
    progress: 0,
    tierCounts: {
      bronze: 0,
      silver: 0,
      gold: 0,
      diamond: 0,
    },
  });
  const [filter, setFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // ============================================
  // 📥 Load Achievements
  // ============================================

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/achievements");
      const achievementsData = response?.data?.data || response?.data || [];

      setAchievements(achievementsData);

      // Calculate stats
      const total = achievementsData.length;
      const earned = achievementsData.filter((a) => a.isEarned).length;
      const tierCounts = { bronze: 0, silver: 0, gold: 0, diamond: 0 };

      achievementsData.forEach((a) => {
        if (a.tier && tierCounts[a.tier] !== undefined) {
          tierCounts[a.tier] += a.isEarned ? 1 : 0;
        }
      });

      setStats({
        total,
        earned,
        progress: total > 0 ? (earned / total) * 100 : 0,
        tierCounts,
      });
    } catch (error) {
      debug.error("Error loading achievements:", error);
      setError(error.message || "خطا در بارگذاری دستاوردها");
      toast.error("خطا در بارگذاری دستاوردها");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 🛠️ Helper Functions
  // ============================================

  const getIcon = (id) => {
    return ACHIEVEMENT_ICONS[id] || "🏆";
  };

  const getTierBadge = (tier) => {
    return TIER_BADGE[tier] || "🥉";
  };

  const getTierColor = (tier) => {
    return TIER_COLORS[tier] || TIER_COLORS.bronze;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      learning: { fa: "یادگیری", en: "Learning" },
      streak: { fa: "استمرار", en: "Streak" },
      vocabulary: { fa: "واژگان", en: "Vocabulary" },
      stories: { fa: "داستان‌ها", en: "Stories" },
      scenarios: { fa: "سناریوها", en: "Scenarios" },
      ai: { fa: "هوش مصنوعی", en: "AI" },
      level: { fa: "سطح", en: "Level" },
      quiz: { fa: "آزمون", en: "Quiz" },
      level_completion: { fa: "تکمیل سطح", en: "Level Completion" },
      special: { fa: "ویژه", en: "Special" },
    };
    return labels[category] || { fa: category, en: category };
  };

  // ============================================
  // 📊 Filtered Achievements
  // ============================================

  const filteredAchievements = achievements.filter((a) => {
    const categoryMatch =
      selectedCategory === "all" || a.category === selectedCategory;
    const statusMatch =
      filter === "all" ||
      (filter === "earned" && a.isEarned) ||
      (filter === "locked" && !a.isEarned);
    return categoryMatch && statusMatch;
  });

  // ============================================
  // 📊 Categories
  // ============================================

  const categories = [
    { id: "all", label: { fa: "همه", en: "All" } },
    {
      id: "learning",
      label: { fa: "یادگیری", en: "Learning" },
      icon: BookOpen,
    },
    { id: "streak", label: { fa: "استمرار", en: "Streak" }, icon: Flame },
    {
      id: "vocabulary",
      label: { fa: "واژگان", en: "Vocabulary" },
      icon: BookOpen,
    },
    {
      id: "stories",
      label: { fa: "داستان‌ها", en: "Stories" },
      icon: MessageSquare,
    },
    { id: "scenarios", label: { fa: "سناریوها", en: "Scenarios" }, icon: Mic },
    { id: "ai", label: { fa: "هوش مصنوعی", en: "AI" }, icon: Sparkles },
    { id: "level", label: { fa: "سطح", en: "Level" }, icon: TrendingUp },
    { id: "quiz", label: { fa: "آزمون", en: "Quiz" }, icon: Target },
    {
      id: "level_completion",
      label: { fa: "تکمیل سطح", en: "Level Completion" },
      icon: Crown,
    },
    { id: "special", label: { fa: "ویژه", en: "Special" }, icon: Sparkles },
  ];

  // ============================================
  // 🖼️ Render
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto" />
          <p className="text-neutral-500 dark:text-neutral-400 mt-4">
            {language === "fa"
              ? "در حال بارگذاری دستاوردها..."
              : "Loading achievements..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <p className="text-neutral-500 dark:text-neutral-400">{error}</p>
        <button
          onClick={loadAchievements}
          className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          {language === "fa" ? "تلاش مجدد" : "Retry"}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              {language === "fa" ? "🏆 دستاوردها" : "🏆 Achievements"}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">
              {language === "fa"
                ? `${stats.earned} از ${stats.total} دستاورد کسب شده`
                : `${stats.earned} of ${stats.total} achievements earned`}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 text-center">
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {stats.earned}/{stats.total}
          </p>
          <p className="text-xs text-neutral-500">
            {language === "fa" ? "کسب شده" : "Earned"}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 text-center">
          <p className="text-2xl font-bold text-amber-600">
            {Math.round(stats.progress)}%
          </p>
          <p className="text-xs text-neutral-500">
            {language === "fa" ? "پیشرفت" : "Progress"}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 text-center">
          <p className="text-2xl font-bold text-amber-700">
            {stats.tierCounts.bronze}
          </p>
          <p className="text-xs text-neutral-500">
            🥉 {language === "fa" ? "برنز" : "Bronze"}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 text-center">
          <p className="text-2xl font-bold text-gray-500">
            {stats.tierCounts.silver}
          </p>
          <p className="text-xs text-neutral-500">
            🥈 {language === "fa" ? "نقره" : "Silver"}
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 text-center">
          <p className="text-2xl font-bold text-yellow-500">
            {stats.tierCounts.gold + stats.tierCounts.diamond}
          </p>
          <p className="text-xs text-neutral-500">
            🥇💎 {language === "fa" ? "طلایی+" : "Gold+"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === "all"
                ? "bg-primary-500 text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            {language === "fa" ? "همه" : "All"}
          </button>
          <button
            onClick={() => setFilter("earned")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === "earned"
                ? "bg-green-500 text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            {language === "fa" ? "کسب شده" : "Earned"}
          </button>
          <button
            onClick={() => setFilter("locked")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === "locked"
                ? "bg-red-500 text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            {language === "fa" ? "قفل" : "Locked"}
          </button>
        </div>

        <div className="flex-1 min-w-[150px]">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none transition"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label[language]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Achievements Grid */}
      {filteredAchievements.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <Trophy className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">
            {language === "fa"
              ? "هیچ دستاوردی با این فیلتر پیدا نشد"
              : "No achievements found matching your filters"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white dark:bg-neutral-900 rounded-xl border-2 p-5 transition-all ${
                achievement.isEarned
                  ? "border-amber-200 dark:border-amber-800"
                  : "border-neutral-200 dark:border-neutral-700 opacity-70"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl ${
                      achievement.isEarned
                        ? `bg-gradient-to-br ${getTierColor(achievement.tier)}`
                        : "bg-neutral-200 dark:bg-neutral-700"
                    }`}
                  >
                    {achievement.isEarned ? (
                      <span>{getIcon(achievement.id)}</span>
                    ) : (
                      <Lock className="w-6 h-6 text-neutral-400" />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                        {achievement.name?.[language] || achievement.name}
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {achievement.category &&
                          getCategoryLabel(achievement.category)[language]}
                      </p>
                    </div>
                    {achievement.isEarned && (
                      <span className="text-lg">
                        {getTierBadge(achievement.tier)}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {achievement.description?.[language] ||
                      achievement.description}
                  </p>

                  {achievement.xpReward && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-amber-500">
                      <Zap className="w-3 h-3" />+{achievement.xpReward} XP
                    </div>
                  )}

                  {!achievement.isEarned &&
                    achievement.progress !== undefined && (
                      <div className="mt-3">
                        <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(achievement.progress, 100)}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">
                          {Math.round(achievement.progress)}%{" "}
                          {language === "fa" ? "پیشرفت" : "progress"}
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AchievementsPage;
