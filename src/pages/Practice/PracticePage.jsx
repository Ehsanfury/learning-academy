/**
 * PracticePage.jsx
 * Path: src/pages/Practice/PracticePage.jsx
 * Description: Daily practice page with Exercise Engine integration
 * Version: 3.3 - Fixed lessons.filter and data extraction
 */

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import api from "../../services/api";
import lessonApi from "../../services/lessonApi";
import exerciseApi from "../../services/exerciseApi";
import debug from "../../utils/debug";
import {
  Dumbbell,
  BookOpen,
  Star,
  Clock,
  CheckCircle,
  Award,
  Flame,
  Zap,
  Target,
  ArrowRight,
  ChevronRight,
  Loader2,
  Volume2,
  Mic,
  PenTool,
  Sparkles,
  TrendingUp,
  Calendar,
  GraduationCap,
  Languages,
  Headphones,
  FileText,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Skeleton from "../../components/ui/Skeleton";

// ============================================
// 📊 Skeleton Components
// ============================================

const PracticeSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div>
        <Skeleton variant="title" className="w-48" />
        <Skeleton variant="subtitle" className="w-64 mt-1" />
      </div>
      <Skeleton variant="button" className="w-32" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
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
    <div>
      <Skeleton variant="title" className="w-48 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-[140px]">
            <div className="flex justify-between mb-2">
              <Skeleton variant="text" className="w-12" />
              <Skeleton variant="text" className="w-12" />
            </div>
            <Skeleton variant="title" className="w-3/4" />
            <Skeleton variant="text" className="w-20 mt-1" />
            <Skeleton variant="text" className="w-24 mt-3" />
          </Card>
        ))}
      </div>
    </div>
    <div>
      <Skeleton variant="title" className="w-48 mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="h-[180px]">
            <div className="flex items-start justify-between">
              <Skeleton variant="avatar" className="w-12 h-12" />
              <Skeleton variant="avatar" className="w-8 h-8" />
            </div>
            <Skeleton variant="title" className="w-32 mt-4" />
            <Skeleton variant="text" className="w-full mt-1" />
            <div className="flex gap-4 mt-4">
              <Skeleton variant="text" className="w-16" />
              <Skeleton variant="text" className="w-16" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

// ============================================
// 📊 PracticePage Component
// ============================================

const PracticePage = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    perfect: 0,
    streak: 0,
    xp: 0,
    dailyGoal: 50,
    todayXP: 0,
  });
  const [practiceTypes, setPracticeTypes] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [results, setResults] = useState(null);
  const [lessons, setLessons] = useState([]);

  // ============================================
  // 📥 Load Data
  // ============================================

  useEffect(() => {
    loadPracticeData();
  }, []);

  const loadPracticeData = async () => {
    try {
      setLoading(true);

      // 1. دریافت درس‌ها
      try {
        const lessonsResponse = await lessonApi.getAllLessons({ limit: 50 });

        // ✅ FIXED: استخراج صحیح داده‌ها از پاسخ API
        let lessonsData = [];

        if (
          lessonsResponse?.data?.data?.lessons &&
          Array.isArray(lessonsResponse.data.data.lessons)
        ) {
          lessonsData = lessonsResponse.data.data.lessons;
        } else if (
          lessonsResponse?.data?.lessons &&
          Array.isArray(lessonsResponse.data.lessons)
        ) {
          lessonsData = lessonsResponse.data.lessons;
        } else if (Array.isArray(lessonsResponse?.data)) {
          lessonsData = lessonsResponse.data;
        } else if (Array.isArray(lessonsResponse)) {
          lessonsData = lessonsResponse;
        } else if (
          lessonsResponse?.data?.data &&
          Array.isArray(lessonsResponse.data.data)
        ) {
          lessonsData = lessonsResponse.data.data;
        }

        // فقط درس‌هایی که بخش دارند
        const lessonsWithContent = lessonsData.filter(
          (lesson) => lesson.totalSections > 0 || lesson.sections?.length > 0,
        );

        setLessons(lessonsWithContent);

        // درس‌های ناقص برای پیشنهاد
        const incomplete = lessonsWithContent
          .filter((l) => !l.progress || l.progress.status === "not_started")
          .slice(0, 3);
        setRecommended(incomplete);
      } catch (e) {
        debug.warn("Could not fetch lessons:", e);
      }

      // 2. دریافت آمار
      try {
        const statsRes = await api.get("/lessons/stats");
        const statsData =
          statsRes?.data?.data || statsRes?.data || statsRes || {};
        setStats((prev) => ({
          ...prev,
          total: statsData.totalLessons || 0,
          completed: statsData.completedLessons || 0,
          perfect: statsData.perfectLessons || 0,
          xp: statsData.totalXP || 0,
          streak: statsData.streak || 0,
        }));
      } catch (e) {
        debug.warn("Could not fetch stats:", e);
      }

      // 3. تنظیم انواع تمرین
      setPracticeTypes([
        {
          id: "vocabulary",
          icon: Languages,
          title: { fa: "واژگان", en: "Vocabulary" },
          description: {
            fa: "تمرین لغات جدید با فلش‌کارت",
            en: "Practice new words with flashcards",
          },
          count: 10,
          xp: 20,
          color: "blue",
          emoji: "📚",
        },
        {
          id: "grammar",
          icon: GraduationCap,
          title: { fa: "گرامر", en: "Grammar" },
          description: {
            fa: "تمرین قوائد گرامری",
            en: "Practice grammar rules",
          },
          count: 8,
          xp: 25,
          color: "purple",
          emoji: "📝",
        },
        {
          id: "listening",
          icon: Headphones,
          title: { fa: "شنیداری", en: "Listening" },
          description: {
            fa: "تمرین گوش دادن و درک مطلب",
            en: "Listening comprehension practice",
          },
          count: 5,
          xp: 30,
          color: "green",
          emoji: "🎧",
        },
        {
          id: "reading",
          icon: FileText,
          title: { fa: "خواندن", en: "Reading" },
          description: {
            fa: "تمرین درک مطلب و خواندن",
            en: "Reading comprehension practice",
          },
          count: 6,
          xp: 30,
          color: "teal",
          emoji: "📖",
        },
        {
          id: "writing",
          icon: PenTool,
          title: { fa: "نوشتاری", en: "Writing" },
          description: {
            fa: "تمرین نوشتن و جمله‌سازی",
            en: "Writing and sentence building practice",
          },
          count: 3,
          xp: 35,
          color: "pink",
          emoji: "✍️",
        },
        {
          id: "mixed",
          icon: Sparkles,
          title: { fa: "ترکیبی", en: "Mixed" },
          description: {
            fa: "تمرین ترکیبی از همه مهارت‌ها",
            en: "Mixed practice of all skills",
          },
          count: 15,
          xp: 40,
          color: "amber",
          emoji: "🎯",
          highlight: true,
        },
      ]);
    } catch (error) {
      debug.error("Error loading practice data:", error);
      toast.error("خطا در بارگذاری تمرین‌ها");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 🛠️ Helper Functions
  // ============================================

  const getColorClasses = (color) => {
    const colors = {
      blue: "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
      purple:
        "bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400",
      green:
        "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400",
      teal: "bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400",
      pink: "bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400",
      amber:
        "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
    };
    return colors[color] || colors.blue;
  };

  const startPractice = (type) => {
    navigate(`/practice/${type.id}`);
  };

  // ============================================
  // 🖼️ Render
  // ============================================

  if (loading) {
    return <PracticeSkeleton />;
  }

  // نمایش نتایج
  if (results) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto px-4 py-12 text-center"
      >
        <Card variant="elevated" padding="xl">
          {results.score === 100 ? (
            <div className="mb-6">
              <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto">
                <Award className="w-10 h-10 text-yellow-500" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-4">
                🎉 {language === "fa" ? "نمره کامل!" : "Perfect Score!"}
              </h2>
            </div>
          ) : results.score >= 80 ? (
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-4">
                {language === "fa" ? "👌 عالی!" : "Great Job!"}
              </h2>
            </div>
          ) : (
            <div className="mb-6">
              <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto">
                <Target className="w-10 h-10 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-4">
                {language === "fa" ? "💪 ادامه بده!" : "Keep Going!"}
              </h2>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card variant="bordered" padding="md">
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {results.score}%
              </p>
              <p className="text-xs text-neutral-500">
                {language === "fa" ? "امتیاز" : "Score"}
              </p>
            </Card>
            <Card variant="bordered" padding="md">
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {results.correct}/{results.total}
              </p>
              <p className="text-xs text-neutral-500">
                {language === "fa" ? "پاسخ صحیح" : "Correct"}
              </p>
            </Card>
            <Card
              variant="bordered"
              padding="md"
              className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800"
            >
              <p className="text-2xl font-bold text-amber-500">
                +{results.earnedXP || 0}
              </p>
              <p className="text-xs text-neutral-500">XP</p>
            </Card>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              variant="primary"
              onClick={() => {
                setResults(null);
                loadPracticeData();
              }}
              icon={RefreshCw}
            >
              {language === "fa" ? "تمرین جدید" : "New Practice"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate("/learn")}
              icon={ArrowRight}
              iconPosition="right"
            >
              {language === "fa" ? "بازگشت به درس‌ها" : "Back to Lessons"}
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  // نمایش اصلی
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* ========== HEADER ========== */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-primary-500" />
            {language === "fa" ? "تمرین‌ها" : "Practice"}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            {language === "fa"
              ? "تمرین‌های روزانه برای تقویت مهارت‌ها"
              : "Daily practice to strengthen your skills"}
          </p>
        </div>
        <Badge variant="warning" size="lg" dot dotPulse>
          <Flame className="w-4 h-4" />
          {stats.streak || 0} {language === "fa" ? "روز" : "days"}
        </Badge>
      </motion.div>

      {/* ========== STATS ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card variant="bordered" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {stats.todayXP || 0}/{stats.dailyGoal || 50}
              </p>
              <p className="text-xs text-neutral-500">
                {language === "fa" ? "XP امروز" : "Today's XP"}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="bordered" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {stats.completed || 0}/{stats.total || 0}
              </p>
              <p className="text-xs text-neutral-500">
                {language === "fa" ? "درس تکمیل شده" : "Lessons Done"}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="bordered" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-500">
                {stats.perfect || 0}
              </p>
              <p className="text-xs text-neutral-500">
                {language === "fa" ? "نمره عالی" : "Perfect"}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="bordered" padding="md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-500">
                {stats.xp || 0}
              </p>
              <p className="text-xs text-neutral-500">XP</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ========== RECOMMENDED LESSONS ========== */}
      {recommended.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            {language === "fa" ? "درس‌های پیشنهادی" : "Recommended Lessons"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommended.map((lesson) => (
              <Link key={lesson.id} to={`/lesson/${lesson.id}`}>
                <Card variant="bordered" padding="md" hover>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="success">{lesson.level}</Badge>
                    <span className="text-xs text-neutral-400">
                      {lesson.estimatedTime || lesson.estimatedMinutes || 20}{" "}
                      min
                    </span>
                  </div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-1">
                    {lesson.title?.[language] ||
                      lesson.title?.fa ||
                      lesson.title?.en ||
                      lesson.id}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    {language === "fa" ? "درس" : "Lesson"}{" "}
                    {lesson.lessonNumber || lesson.order}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-primary-500">
                    <span>
                      {language === "fa" ? "شروع یادگیری" : "Start Learning"}
                    </span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* ========== PRACTICE TYPES ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          {language === "fa" ? "انواع تمرین" : "Practice Types"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {practiceTypes.map((type) => {
            const Icon = type.icon;
            return (
              <motion.button
                key={type.id}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startPractice(type)}
                className="text-left"
              >
                <Card
                  variant={type.highlight ? "elevated" : "bordered"}
                  padding="lg"
                  className={`transition-all ${
                    type.highlight
                      ? "border-2 border-amber-500 dark:border-amber-500 shadow-lg shadow-amber-500/10"
                      : "hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`p-3 rounded-xl ${getColorClasses(type.color)}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl">{type.emoji}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mt-4">
                    {type.title[language]}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {type.description[language]}
                  </p>
                  <div className="flex items-center gap-4 mt-4 text-xs text-neutral-400">
                    <span>
                      {type.count} {language === "fa" ? "سوال" : "questions"}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" />+{type.xp} XP
                    </span>
                  </div>
                  {type.highlight && (
                    <div className="mt-3">
                      <Badge variant="warning" size="sm">
                        ⭐ {language === "fa" ? "پیشنهادی" : "Recommended"}
                      </Badge>
                    </div>
                  )}
                </Card>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* ========== QUICK TIP ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card
          variant="bordered"
          padding="md"
          className="bg-primary-50 dark:bg-primary-950 border-primary-200 dark:border-primary-800"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-primary-500" />
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              {language === "fa"
                ? "💡 تمرین روزانه خود را شروع کنید و هر روز ۵۰ XP کسب کنید!"
                : "💡 Start your daily practice and earn 50 XP every day!"}
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default PracticePage;
