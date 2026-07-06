/**
 * LearnPage.jsx - Version 5.0
 * Path: src/pages/Learn/LearnPage.jsx
 * Description: Learning path with full lesson structure support
 * Changes:
 * - ✅ Fixed: lessons.filter is not a function
 * - ✅ Using Card, CardHeader, CardBody components
 * - ✅ Using Badge component for status labels
 * - ✅ Using Skeleton for loading states
 * - ✅ Using Tabs for level navigation
 * - ✅ Using Button component
 * - ✅ Better error handling
 * - ✅ Performance optimizations
 * - ✅ Shows totalSections for each lesson
 * - ✅ Click on lesson navigates to LessonPage
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@context/AuthContext";
import { useLanguageContext } from "@context/LanguageContext";
import api from "@services/api";
import {
  BookOpen,
  Lock,
  CheckCircle,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trophy,
  Zap,
  Target,
  ArrowRight,
  Sparkles,
  Flame,
  Award,
  GraduationCap,
  BookMarked,
  Dumbbell,
  TrendingUp,
  Calendar,
  Crown,
  Medal,
  Users,
  Globe,
  MapPin,
  Compass,
  Rocket,
  BarChart3,
  Play,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  Search,
  BookText,
} from "lucide-react";
import { useLanguage } from "@context/LanguageContext";
import toast from "react-hot-toast";

// ✅ استفاده از کامپوننت‌های جدید UI
import { Card, CardHeader, CardBody, CardFooter } from "@components/ui";
import Button from "@components/ui/Button";
import Badge from "@components/ui/Badge";
import Skeleton from "@components/ui/Skeleton";
import Tabs from "@components/ui/Tabs";
import Loader from "@components/Loader";

// ============================================
// 📊 Level Config
// ============================================

const LEVEL_CONFIG = {
  A1: {
    label: { fa: "مبتدی", en: "Beginner", de: "Anfänger" },
    color: "from-green-400 to-green-600",
    badgeColor: "bg-green-500",
    icon: "🌱",
    description: {
      fa: "شروع یادگیری زبان آلمانی از صفر",
      en: "Start learning German from zero",
      de: "Deutsch lernen von Null an",
    },
  },
  A2: {
    label: { fa: "مقدماتی", en: "Elementary", de: "Grundlegend" },
    color: "from-blue-400 to-blue-600",
    badgeColor: "bg-blue-500",
    icon: "📘",
    description: {
      fa: "تکمیل مبانی و شروع مکالمات ساده",
      en: "Complete basics and start simple conversations",
      de: "Grundlagen vervollständigen und einfache Gespräche beginnen",
    },
  },
  B1: {
    label: { fa: "متوسط", en: "Intermediate", de: "Mittelstufe" },
    color: "from-amber-400 to-amber-600",
    badgeColor: "bg-amber-500",
    icon: "📗",
    description: {
      fa: "صحبت درباره موضوعات روزمره و شخصی",
      en: "Talk about everyday and personal topics",
      de: "Über alltägliche und persönliche Themen sprechen",
    },
  },
  B2: {
    label: {
      fa: "متوسط پیشرفته",
      en: "Upper Intermediate",
      de: "Obere Mittelstufe",
    },
    color: "from-orange-400 to-orange-600",
    badgeColor: "bg-orange-500",
    icon: "📙",
    description: {
      fa: "مکالمات پیچیده و درک متون تخصصی",
      en: "Complex conversations and understanding specialized texts",
      de: "Komplexe Gespräche und Verstehen von Fachtexten",
    },
  },
  C1: {
    label: { fa: "پیشرفته", en: "Advanced", de: "Fortgeschritten" },
    color: "from-red-400 to-red-600",
    badgeColor: "bg-red-500",
    icon: "📕",
    description: {
      fa: "تسلط بر زبان برای اهداف حرفه‌ای و آکادمیک",
      en: "Mastery of language for professional and academic purposes",
      de: "Beherrschung der Sprache für berufliche und akademische Zwecke",
    },
  },
  C2: {
    label: { fa: "تسلط", en: "Mastery", de: "Perfektion" },
    color: "from-purple-400 to-purple-600",
    badgeColor: "bg-purple-500",
    icon: "💠",
    description: {
      fa: "تسلط کامل بر زبان در تمام موقعیت‌ها",
      en: "Complete mastery of the language in all situations",
      de: "Vollständige Beherrschung der Sprache in allen Situationen",
    },
  },
};

// ============================================
// 📊 Skeleton Components
// ============================================

const StatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i} className="h-[88px]">
        <div className="flex items-center gap-3">
          <Skeleton variant="avatar" className="w-10 h-10" />
          <div>
            <Skeleton variant="text" className="w-16" />
            <Skeleton variant="caption" className="w-20 mt-1" />
          </div>
        </div>
      </Card>
    ))}
  </div>
);

const LessonsGridSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <Card key={i} className="h-[200px]">
        <div className="flex items-start justify-between mb-3">
          <Skeleton variant="text" className="w-16" />
          <Skeleton variant="avatar" className="w-6 h-6" />
        </div>
        <Skeleton variant="title" className="w-3/4" />
        <div className="flex items-center gap-4 mt-3">
          <Skeleton variant="text" className="w-12" />
          <Skeleton variant="text" className="w-12" />
          <Skeleton variant="text" className="w-12" />
        </div>
        <Skeleton variant="text" className="w-1/2 mt-3" />
      </Card>
    ))}
  </div>
);

// ============================================
// 📊 LearnPage Component
// ============================================

const LearnPage = () => {
  const { user } = useAuth();
  const { language } = useLanguageContext();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState("A1");
  const [viewMode, setViewMode] = useState("grid");
  const [showLocked, setShowLocked] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    perfect: 0,
    inProgress: 0,
    totalXP: 0,
  });

  // ============================================
  // 📥 Load Data
  // ============================================

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const lessonsRes = await api.get("/lessons");

      // ✅ FIXED: نرمالایز کردن پاسخ API
      let lessonsData = [];

      // پشتیبانی از ساختارهای مختلف پاسخ API
      if (lessonsRes?.data?.data?.lessons) {
        lessonsData = lessonsRes.data.data.lessons;
      } else if (lessonsRes?.data?.lessons) {
        lessonsData = lessonsRes.data.lessons;
      } else if (Array.isArray(lessonsRes?.data)) {
        lessonsData = lessonsRes.data;
      } else if (Array.isArray(lessonsRes)) {
        lessonsData = lessonsRes;
      } else if (
        lessonsRes?.data?.data &&
        Array.isArray(lessonsRes.data.data)
      ) {
        lessonsData = lessonsRes.data.data;
      }

      // ✅ اطمینان از اینکه آرایه است
      if (!Array.isArray(lessonsData)) {
        lessonsData = [];
      }

      setLessons(lessonsData);

      // محاسبه آمار
      const total = lessonsData.length;
      const completed = lessonsData.filter(
        (l) =>
          l.progress?.status === "completed" ||
          l.progress?.status === "perfect",
      ).length;
      const perfect = lessonsData.filter(
        (l) => l.progress?.status === "perfect",
      ).length;
      const inProgress = lessonsData.filter(
        (l) => l.progress?.status === "in_progress",
      ).length;

      setStats({
        total,
        completed,
        perfect,
        inProgress,
        totalXP: user?.xp || 0,
      });

      // دریافت لیست سطوح از درس‌ها
      const uniqueLevels = [
        ...new Set(lessonsData.map((l) => l.level).filter(Boolean)),
      ];
      if (uniqueLevels.length > 0) {
        setLevels(uniqueLevels);
      } else {
        setLevels(["A1", "A2", "B1", "B2", "C1", "C2"]);
      }
    } catch (error) {
      console.error("Error loading learning data:", error);
      setError(error.message || "خطا در بارگذاری مسیر یادگیری");
      toast.error("خطا در بارگذاری مسیر یادگیری");
      setLevels(["A1", "A2", "B1", "B2", "C1", "C2"]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 🛠️ Helper Functions
  // ============================================

  const getLevelConfig = useCallback((level) => {
    if (LEVEL_CONFIG[level]) {
      return LEVEL_CONFIG[level];
    }
    return {
      label: { fa: level, en: level, de: level },
      color: "from-gray-400 to-gray-600",
      badgeColor: "bg-gray-500",
      icon: "📚",
      description: {
        fa: `سطح ${level}`,
        en: `Level ${level}`,
        de: `Niveau ${level}`,
      },
    };
  }, []);

  const getLevelProgress = useCallback(
    (level) => {
      const levelLessons = lessons.filter((l) => l.level === level);
      const completed = levelLessons.filter(
        (l) =>
          l.progress?.status === "completed" ||
          l.progress?.status === "perfect",
      ).length;
      return levelLessons.length > 0
        ? Math.round((completed / levelLessons.length) * 100)
        : 0;
    },
    [lessons],
  );

  const getLessonStatus = useCallback((lesson) => {
    if (lesson.progress?.status === "perfect") return "perfect";
    if (lesson.progress?.status === "completed") return "completed";
    if (lesson.progress?.status === "in_progress") return "in-progress";
    return "available";
  }, []);

  const getLessonIcon = useCallback((status) => {
    switch (status) {
      case "perfect":
        return Crown;
      case "completed":
        return CheckCircle;
      case "in-progress":
        return Play;
      default:
        return BookOpen;
    }
  }, []);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case "perfect":
        return "success";
      case "completed":
        return "success";
      case "in-progress":
        return "warning";
      default:
        return "neutral";
    }
  }, []);

  const getStatusBadgeVariant = useCallback((status) => {
    switch (status) {
      case "perfect":
        return "success";
      case "completed":
        return "success";
      case "in-progress":
        return "warning";
      default:
        return "neutral";
    }
  }, []);

  const getStatusLabel = useCallback((status) => {
    const labels = {
      perfect: { fa: "🌟 عالی", en: "🌟 Perfect" },
      completed: { fa: "✅ کامل", en: "✅ Completed" },
      "in-progress": { fa: "🔄 در حال پیشرفت", en: "🔄 In Progress" },
      available: { fa: "▶️ شروع", en: "▶️ Start" },
    };
    return labels[status] || labels.available;
  }, []);

  const getLocalizedTitle = (lesson) => {
    if (!lesson?.title) return "بدون عنوان";
    if (typeof lesson.title === "string") return lesson.title;
    return (
      lesson.title[language] ||
      lesson.title.fa ||
      lesson.title.en ||
      "بدون عنوان"
    );
  };

  const filteredLessons = useMemo(() => {
    if (!Array.isArray(lessons)) return [];
    return lessons.filter((lesson) => {
      const levelMatch = lesson.level === selectedLevel;
      const title = getLocalizedTitle(lesson);
      const searchMatch =
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.id?.toLowerCase().includes(searchTerm.toLowerCase());
      const lockMatch = showLocked ? true : !lesson.isLocked;
      return levelMatch && searchMatch && lockMatch;
    });
  }, [lessons, selectedLevel, searchTerm, showLocked, language]);

  // ============================================
  // 📊 Level Tabs
  // ============================================

  const levelTabs = useMemo(() => {
    return levels.map((level) => {
      const config = getLevelConfig(level);
      const progress = getLevelProgress(level);
      return {
        id: level,
        label: `${level} ${Math.round(progress)}%`,
        icon: () => <span>{config.icon}</span>,
        count: Math.round(progress),
      };
    });
  }, [levels, getLevelConfig, getLevelProgress]);

  // ============================================
  // 📊 Stats
  // ============================================

  const quickStats = useMemo(
    () => [
      {
        icon: BookOpen,
        label: { fa: "درس تکمیل شده", en: "Lessons Completed" },
        value: `${stats.completed}/${stats.total}`,
        color: "from-blue-400 to-blue-600",
      },
      {
        icon: Crown,
        label: { fa: "نمره عالی", en: "Perfect Scores" },
        value: stats.perfect,
        color: "from-amber-400 to-amber-600",
      },
      {
        icon: Play,
        label: { fa: "در حال پیشرفت", en: "In Progress" },
        value: stats.inProgress,
        color: "from-orange-400 to-orange-600",
      },
      {
        icon: Zap,
        label: { fa: "کل XP", en: "Total XP" },
        value: stats.totalXP,
        color: "from-purple-400 to-purple-600",
      },
    ],
    [stats],
  );

  // ============================================
  // 🖼️ Render
  // ============================================

  // Loading State
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <Skeleton variant="title" className="w-64" />
            <Skeleton variant="subtitle" className="w-48 mt-1" />
          </div>
          <Skeleton variant="button" className="w-10 h-10" />
        </div>

        {/* Stats */}
        <StatsSkeleton />

        {/* Level Tabs */}
        <Skeleton variant="card" className="h-12" />

        {/* Search */}
        <div className="flex gap-3">
          <Skeleton variant="text" className="h-10 flex-1" />
          <Skeleton variant="button" className="w-32" />
        </div>

        {/* Lessons Grid */}
        <LessonsGridSkeleton />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="w-16 h-16 text-danger-500" />
        <p className="text-neutral-500 dark:text-neutral-400">{error}</p>
        <Button variant="primary" size="lg" onClick={loadData} icon={RefreshCw}>
          {language === "fa" ? "تلاش مجدد" : "Retry"}
        </Button>
      </div>
    );
  }

  const progress =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* ========== HEADER ========== */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Compass className="w-6 h-6 text-primary-500" />
            {language === "fa" ? "🗺️ مسیر یادگیری" : "🗺️ Learning Path"}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            {language === "fa"
              ? `${stats.completed} از ${stats.total} درس تکمیل شده • ${Math.round(progress)}% پیشرفت`
              : `${stats.completed} of ${stats.total} lessons completed • ${Math.round(progress)}% progress`}
          </p>
        </div>

        <button
          onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          title={viewMode === "grid" ? "List View" : "Grid View"}
        >
          {viewMode === "grid" ? (
            <BarChart3 className="w-5 h-5 text-neutral-500" />
          ) : (
            <div className="grid grid-cols-2 gap-0.5">
              <div className="w-2 h-2 bg-neutral-500 rounded-sm" />
              <div className="w-2 h-2 bg-neutral-500 rounded-sm" />
              <div className="w-2 h-2 bg-neutral-500 rounded-sm" />
              <div className="w-2 h-2 bg-neutral-500 rounded-sm" />
            </div>
          )}
        </button>
      </motion.div>

      {/* ========== STATS ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              variant="bordered"
              padding="md"
              className="hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 bg-gradient-to-br ${stat.color} rounded-lg`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {stat.value}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {stat.label[language]}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </motion.div>

      {/* ========== LEVEL TABS ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex flex-wrap gap-2">
          {levels.map((level) => {
            const config = getLevelConfig(level);
            const progress = getLevelProgress(level);
            return (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                  selectedLevel === level
                    ? "bg-primary-500 text-white shadow-lg shadow-primary-500/25"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }`}
              >
                <span>{config.icon}</span>
                <span>{level}</span>
                <span
                  className={`text-xs ${selectedLevel === level ? "text-white/80" : "text-neutral-400"}`}
                >
                  {progress}%
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ========== LEVEL DESCRIPTION ========== */}
      {selectedLevel && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="bordered" padding="md">
            <div className="flex items-center gap-3">
              <span className="text-3xl">
                {getLevelConfig(selectedLevel).icon || "📚"}
              </span>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {getLevelConfig(selectedLevel).label?.[language] ||
                    selectedLevel}{" "}
                  ({selectedLevel})
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {getLevelConfig(selectedLevel).description?.[language] || ""}
                </p>
              </div>
              <div className="ml-auto">
                <Badge variant="primary">
                  {Math.round(getLevelProgress(selectedLevel))}%
                </Badge>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ========== SEARCH & FILTERS ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap gap-3"
      >
        <div className="flex-1 min-w-[200px] relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              language === "fa" ? "جستجوی درس..." : "Search lessons..."
            }
            className="w-full px-4 py-2.5 pr-10 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        </div>

        <label className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition">
          <input
            type="checkbox"
            checked={showLocked}
            onChange={(e) => setShowLocked(e.target.checked)}
            className="w-4 h-4 text-primary-500 rounded focus:ring-2 focus:ring-primary-500"
          />
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            {language === "fa" ? "نمایش درس‌های قفل" : "Show locked lessons"}
          </span>
        </label>
      </motion.div>

      {/* ========== LESSONS ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {filteredLessons.length === 0 ? (
          <Card variant="bordered" padding="xl" className="text-center py-12">
            <BookOpen className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
            <p className="text-neutral-500 dark:text-neutral-400">
              {searchTerm
                ? language === "fa"
                  ? "هیچ درسی با این جستجو پیدا نشد"
                  : "No lessons found matching your search"
                : language === "fa"
                  ? "هیچ درسی در این سطح وجود ندارد"
                  : "No lessons in this level"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 text-sm text-primary-500 hover:text-primary-600 transition"
              >
                {language === "fa" ? "پاک کردن جستجو" : "Clear search"}
              </button>
            )}
          </Card>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLessons.map((lesson, index) => {
              const status = getLessonStatus(lesson);
              const Icon = getLessonIcon(status);
              const statusLabel = getStatusLabel(status);
              const isLocked = lesson.isLocked || false;
              const statusBadgeVariant = getStatusBadgeVariant(status);
              const title = getLocalizedTitle(lesson);

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    variant={
                      isLocked
                        ? "bordered"
                        : status === "perfect"
                          ? "elevated"
                          : "bordered"
                    }
                    padding="md"
                    hover={!isLocked}
                    onClick={() => {
                      if (!isLocked) {
                        navigate(`/lesson/${lesson.id}`);
                      }
                    }}
                    className={`
                      ${isLocked ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                      ${status === "perfect" ? "border-2 border-amber-200 dark:border-amber-800" : ""}
                    `}
                  >
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-neutral-500">
                            {language === "fa" ? "درس" : "Lesson"}{" "}
                            {lesson.lessonNumber || lesson.order || 1}
                          </span>
                          {lesson.unit && (
                            <span className="text-xs text-neutral-400">
                              • Unit {lesson.unit}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={statusBadgeVariant} size="xs">
                            {statusLabel[language]}
                          </Badge>
                          {isLocked && (
                            <Lock className="w-4 h-4 text-neutral-400" />
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2">
                        {title}
                      </h3>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lesson.estimatedTime ||
                            lesson.estimatedMinutes ||
                            20}{" "}
                          min
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          {lesson.xpReward || 50} XP
                        </span>
                        {lesson.totalSections > 0 && (
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {lesson.totalSections}
                            {language === "fa" ? " بخش" : " sec"}
                          </span>
                        )}
                      </div>

                      {/* CEFR Level */}
                      {lesson.cefr && (
                        <div className="mt-1">
                          <Badge variant="secondary" size="xs">
                            {lesson.cefr}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          // List View
          <div className="space-y-3">
            {filteredLessons.map((lesson, index) => {
              const status = getLessonStatus(lesson);
              const isLocked = lesson.isLocked || false;
              const statusBadgeVariant = getStatusBadgeVariant(status);
              const title = getLocalizedTitle(lesson);

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    variant="bordered"
                    padding="md"
                    hover={!isLocked}
                    onClick={() => {
                      if (!isLocked) {
                        navigate(`/lesson/${lesson.id}`);
                      }
                    }}
                    className={
                      isLocked
                        ? "opacity-60 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                          {title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-neutral-500 flex-wrap">
                          <span>
                            {language === "fa" ? "درس" : "Lesson"}{" "}
                            {lesson.lessonNumber || lesson.order || 1}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {lesson.estimatedTime || 20} min
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            {lesson.xpReward || 50} XP
                          </span>
                          {lesson.totalSections > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                {lesson.totalSections}
                                {language === "fa" ? " بخش" : " sec"}
                              </span>
                            </>
                          )}
                          <span>•</span>
                          <Badge variant={statusBadgeVariant} size="xs">
                            {getStatusLabel(status)[language]}
                          </Badge>
                          {isLocked && <Lock className="w-3 h-3" />}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* ========== QUICK ACTIONS ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <Link to="/practice">
          <Card variant="bordered" padding="md" hover className="text-center">
            <Dumbbell className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {language === "fa" ? "تمرین سریع" : "Quick Practice"}
            </p>
          </Card>
        </Link>

        <Link to="/vocabulary">
          <Card variant="bordered" padding="md" hover className="text-center">
            <BookMarked className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {language === "fa" ? "لغات" : "Vocabulary"}
            </p>
          </Card>
        </Link>

        <Link to="/ai-tutor">
          <Card variant="bordered" padding="md" hover className="text-center">
            <Sparkles className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {language === "fa" ? "معلم هوش مصنوعی" : "AI Tutor"}
            </p>
          </Card>
        </Link>

        <Link to="/stories">
          <Card variant="bordered" padding="md" hover className="text-center">
            <BookText className="w-6 h-6 text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {language === "fa" ? "داستان‌ها" : "Stories"}
            </p>
          </Card>
        </Link>
      </motion.div>
    </div>
  );
};

export default LearnPage;
