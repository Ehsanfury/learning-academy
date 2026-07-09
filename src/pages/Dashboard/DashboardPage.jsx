/**
 * DashboardPage.jsx
 * Path: src/pages/Dashboard/DashboardPage.jsx
 * Description: Dashboard page with real data from API
 * Version: 6.0 - Full user menu with About & Support + Real API data
 * Changes:
 * - ✅ FIXED: Added About and Support/Contact to user dropdown menu
 * - ✅ FIXED: Connected weekly activity to real API
 * - ✅ FIXED: Connected achievements to real API
 * - ✅ FIXED: CardHeader, CardBody, CardFooter imports added
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import lessonApi from "../../services/lessonApi";
import debug from "../../utils/debug";
import {
  Flame,
  Zap,
  Target,
  TrendingUp,
  BookOpen,
  Trophy,
  Clock,
  Star,
  Activity,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Calendar,
  ArrowRight,
  Info,
  Headphones,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";
import XPCard from "../../components/XPCard";
import AchievementCard from "../../components/AchievementCard";
import LessonCard from "../../components/LessonCard";
import ProgressBar from "../../components/ProgressBar";
import Loader from "../../components/Loader";
import toast from "react-hot-toast";

import Card, {
  CardHeader,
  CardBody,
  CardFooter,
} from "../../components/ui/Card";
import Skeleton from "../../components/ui/Skeleton";
import Button from "../../components/ui/Button";

// ============================================
// 📊 Skeleton Components
// ============================================

const StatsSkeleton = () => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
    <div className="lg:col-span-2">
      <Card className="h-[180px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Skeleton variant="avatar" className="w-12 h-12" />
            <div>
              <Skeleton variant="text" className="w-24" />
              <Skeleton variant="text" className="w-16 mt-2" />
            </div>
          </div>
          <div className="text-right">
            <Skeleton variant="text" className="w-16" />
            <Skeleton variant="text" className="w-12 mt-2" />
          </div>
        </div>
        <div className="mt-2">
          <div className="flex justify-between mb-2">
            <Skeleton variant="text" className="w-20" />
            <Skeleton variant="text" className="w-16" />
          </div>
          <Skeleton variant="text" className="h-2" />
        </div>
      </Card>
    </div>
    {[1, 2].map((i) => (
      <Card key={i} className="h-[180px]">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton variant="avatar" className="w-10 h-10" />
          <div>
            <Skeleton variant="text" className="w-24" />
            <Skeleton variant="text" className="w-16 mt-1" />
          </div>
        </div>
        <Skeleton variant="text" className="h-2" />
      </Card>
    ))}
  </div>
);

const LessonsSkeleton = () => (
  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="h-[120px]">
        <div className="flex items-start gap-3">
          <Skeleton variant="avatar" className="w-10 h-10" />
          <div className="flex-1">
            <Skeleton variant="text" className="w-32" />
            <div className="flex items-center gap-3 mt-2">
              <Skeleton variant="text" className="w-16" />
              <Skeleton variant="text" className="w-12" />
            </div>
          </div>
        </div>
      </Card>
    ))}
  </div>
);

// ============================================
// 📊 Dashboard Component
// ============================================

function DashboardPage() {
  const { language } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [greeting, setGreeting] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [stats, setStats] = useState({
    xp: 0,
    level: 1,
    nextLevelXP: 2500,
    streak: 0,
    todayXP: 0,
    dailyGoal: 50,
    completedLessons: 0,
    totalLessons: 0,
  });

  const [recentLessons, setRecentLessons] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [nextLesson, setNextLesson] = useState(null);
  const [weeklyActivity, setWeeklyActivity] = useState([]);

  // ✅ User menu items with About & Support (like MainLayout)
  const userMenuItems = useMemo(
    () => [
      {
        path: "/dashboard",
        label: { fa: "داشبورد", en: "Dashboard" },
        icon: LayoutDashboard,
      },
      {
        path: "/profile",
        label: { fa: "پروفایل", en: "Profile" },
        icon: User,
      },
      {
        path: "/settings",
        label: { fa: "تنظیمات", en: "Settings" },
        icon: Settings,
      },
      {
        type: "divider",
      },
      // ✅ NEW: About Us (like MainLayout)
      {
        path: "/about",
        label: { fa: "درباره ما", en: "About Us" },
        icon: Info,
      },
      // ✅ NEW: Support / Contact Us (like MainLayout)
      {
        path: "/contact",
        label: { fa: "ارتباط با پشتیبانی", en: "Contact Us" },
        icon: Headphones,
      },
      {
        type: "divider",
      },
      {
        label: { fa: "خروج", en: "Logout" },
        icon: LogOut,
        isLogout: true,
      },
    ],
    [],
  );

  // ============================================
  // 📥 Load Dashboard Data
  // ============================================

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. دریافت درس‌ها
      const lessonsRes = await lessonApi.getAllLessons({ limit: 50 });

      let lessonsData = [];

      if (
        lessonsRes?.data?.data?.lessons &&
        Array.isArray(lessonsRes.data.data.lessons)
      ) {
        lessonsData = lessonsRes.data.data.lessons;
      } else if (
        lessonsRes?.data?.lessons &&
        Array.isArray(lessonsRes.data.lessons)
      ) {
        lessonsData = lessonsRes.data.lessons;
      } else if (Array.isArray(lessonsRes?.data?.data)) {
        lessonsData = lessonsRes.data.data;
      } else if (Array.isArray(lessonsRes?.data)) {
        lessonsData = lessonsRes.data;
      } else if (Array.isArray(lessonsRes)) {
        lessonsData = lessonsRes;
      }

      if (!Array.isArray(lessonsData)) {
        lessonsData = [];
      }

      // 2. دریافت آمار
      try {
        const statsRes = await api.get("/lessons/stats");
        const statsData =
          statsRes?.data?.data || statsRes?.data || statsRes || {};
        setStats((prev) => ({
          ...prev,
          completedLessons: statsData.completedLessons || 0,
          totalLessons: statsData.totalLessons || lessonsData.length,
          xp: statsData.xp || user?.xp || 0,
          level: statsData.level || user?.level || 1,
          streak: statsData.streak || user?.streak || 0,
          todayXP: statsData.todayXP || 0,
          dailyGoal: statsData.dailyGoal || 50,
        }));
      } catch (e) {
        debug.warn("⚠️ Could not fetch stats:", e);
      }

      // 3. پیدا کردن درس بعدی
      if (Array.isArray(lessonsData) && lessonsData.length > 0) {
        const next = lessonsData.find(
          (l) => !l.progress || l.progress.status === "not_started",
        );
        setNextLesson(next || lessonsData[0]);
        setRecentLessons(lessonsData.slice(0, 5));
      } else {
        setNextLesson(null);
        setRecentLessons([]);
      }

      // 4. ✅ دریافت دستاوردها از API واقعی
      try {
        const achRes = await api.get("/achievements");
        const achData = achRes?.data?.data || achRes?.data || [];
        setAchievements(Array.isArray(achData) ? achData.slice(0, 4) : []);
      } catch (e) {
        debug.warn("⚠️ Could not fetch achievements:", e);
        setAchievements([]);
      }

      // 5. ✅ دریافت فعالیت هفتگی از API واقعی
      try {
        const activityRes = await api.get("/progress/daily-stats?days=7");
        const activityData = activityRes?.data?.data || activityRes?.data || [];

        if (Array.isArray(activityData) && activityData.length > 0) {
          setWeeklyActivity(activityData);
        } else {
          // Fallback to empty data
          setWeeklyActivity(
            Array.from({ length: 7 }, (_, i) => ({
              day: i + 1,
              date: new Date(Date.now() - (6 - i) * 86400000)
                .toISOString()
                .split("T")[0],
              count: 0,
              xp: 0,
            })),
          );
        }
      } catch (e) {
        debug.warn("⚠️ Could not fetch weekly activity:", e);
        setWeeklyActivity(
          Array.from({ length: 7 }, (_, i) => ({
            day: i + 1,
            date: new Date(Date.now() - (6 - i) * 86400000)
              .toISOString()
              .split("T")[0],
            count: 0,
            xp: 0,
          })),
        );
      }

      setRetryCount(0);
    } catch (error) {
      debug.error("❌ Error loading dashboard:", error);
      setError(error.message || "خطا در بارگذاری داشبورد");
      toast.error("خطا در بارگذاری داشبورد");
    } finally {
      setLoading(false);
    }
  }, [user?.xp, user?.level, user?.streak]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // ============================================
  // 🕐 Greeting
  // ============================================

  useEffect(() => {
    const hour = new Date().getHours();
    if (language === "fa") {
      if (hour < 12) setGreeting("صبح بخیر");
      else if (hour < 17) setGreeting("ظهر بخیر");
      else if (hour < 21) setGreeting("عصر بخیر");
      else setGreeting("شب بخیر");
    } else {
      if (hour < 12) setGreeting("Good Morning");
      else if (hour < 17) setGreeting("Good Afternoon");
      else setGreeting("Good Evening");
    }
  }, [language]);

  // ============================================
  // 🎮 Actions
  // ============================================

  const handleContinueLesson = useCallback(() => {
    if (nextLesson) {
      navigate(`/lesson/${nextLesson.id}`);
    } else {
      navigate("/learn");
    }
  }, [nextLesson, navigate]);

  const retryLoad = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    loadDashboardData();
  }, [loadDashboardData]);

  const handleLogout = useCallback(async () => {
    await logout();
    setUserMenuOpen(false);
    navigate("/login");
  }, [logout, navigate]);

  // ============================================
  // 📊 Computed Values
  // ============================================

  const weekDays = useMemo(
    () => ({
      fa: ["ش", "ی", "د", "س", "چ", "پ", "ج"],
      en: ["M", "T", "W", "T", "F", "S", "S"],
    }),
    [],
  );

  const maxXP = useMemo(
    () => Math.max(...weeklyActivity.map((d) => d.xp || 0), 1),
    [weeklyActivity],
  );

  const quickStats = useMemo(
    () => [
      {
        icon: CheckCircle,
        label: { fa: "درس تکمیل شده", en: "Lessons Done" },
        value: `${stats.completedLessons || 0}/${stats.totalLessons || 0}`,
        color: "from-green-400 to-green-600",
      },
      {
        icon: BookOpen,
        label: { fa: "کل درس‌ها", en: "Total Lessons" },
        value: stats.totalLessons || 0,
        color: "from-blue-400 to-blue-600",
      },
      {
        icon: Star,
        label: { fa: "سطح", en: "Level" },
        value: stats.level || 1,
        color: "from-purple-400 to-purple-600",
      },
      {
        icon: Flame,
        label: { fa: "گل‌زنی", en: "Streak" },
        value: stats.streak || 0,
        color: "from-amber-400 to-amber-600",
      },
    ],
    [stats],
  );

  const quickActions = useMemo(
    () => [
      {
        path: "/practice",
        icon: Target,
        label: { fa: "تمرین سریع", en: "Quick Practice" },
        color: "bg-blue-500",
      },
      {
        path: "/ai-tutor",
        icon: Zap,
        label: { fa: "چت با AI", en: "Chat with AI" },
        color: "bg-purple-500",
      },
      {
        path: "/stories",
        icon: BookOpen,
        label: { fa: "داستان روز", en: "Daily Story" },
        color: "bg-green-500",
      },
      {
        path: "/dictionary",
        icon: BookOpen,
        label: { fa: "دیکشنری", en: "Dictionary" },
        color: "bg-amber-500",
      },
    ],
    [],
  );

  // ============================================
  // 🖼️ Render
  // ============================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton variant="title" className="w-48" />
            <Skeleton variant="subtitle" className="w-32 mt-2" />
          </div>
          <Skeleton variant="button" className="w-32" />
        </div>
        <StatsSkeleton />
        <div>
          <div className="flex items-center justify-between mb-4">
            <Skeleton variant="title" className="w-40" />
            <Skeleton variant="text" className="w-20" />
          </div>
          <LessonsSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          {language === "fa" ? "خطا در بارگذاری" : "Loading Error"}
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 mb-6 text-center max-w-md">
          {error}
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={retryLoad}
          icon={RefreshCw}
        >
          {language === "fa" ? "تلاش مجدد" : "Retry"}
        </Button>
      </div>
    );
  }

  // ============================================
  // 🖼️ Main Render
  // ============================================

  return (
    <div className="space-y-6">
      {/* ========== HEADER ========== */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {greeting}،{" "}
            {user?.name?.split(" ")[0] ||
              (language === "fa" ? "کاربر" : "User")}{" "}
            👋
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            {language === "fa"
              ? "امروز رو عالی شروع کن!"
              : "Let's make today great!"}
          </p>
        </div>

        {/* ✅ User Dropdown Menu with About & Support (like MainLayout) */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-sm">
              {user?.name?.charAt(0) || "U"}
            </div>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300 hidden sm:block">
              {user?.name?.split(" ")[0] || "User"}
            </span>
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>

          {/* Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{
              opacity: userMenuOpen ? 1 : 0,
              y: userMenuOpen ? 0 : -10,
            }}
            className={`absolute right-0 mt-2 w-56 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden z-50 ${
              userMenuOpen ? "block" : "hidden"
            }`}
          >
            <div className="p-3 border-b border-neutral-200 dark:border-neutral-700">
              <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-neutral-500 truncate">
                {user?.email || ""}
              </p>
            </div>

            <div className="p-1">
              {userMenuItems.map((item, index) => {
                if (item.type === "divider") {
                  return (
                    <hr
                      key={index}
                      className="my-1 border-neutral-200 dark:border-neutral-700"
                    />
                  );
                }

                const Icon = item.icon;

                if (item.isLogout) {
                  return (
                    <button
                      key={index}
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label[language]}
                    </button>
                  );
                }

                return (
                  <Link
                    key={index}
                    to={item.path}
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <Icon className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                    {item.label[language]}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* ========== TOP CARDS ========== */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <XPCard
            xp={stats.xp || 0}
            level={stats.level || 1}
            nextLevelXP={stats.nextLevelXP || 2500}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="default" padding="md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-success-100 dark:bg-success-900 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-success-500" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">
                  {language === "fa" ? "هدف روزانه" : "Daily Goal"}
                </p>
                <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {stats.todayXP || 0} / {stats.dailyGoal || 50} XP
                </p>
              </div>
            </div>
            <ProgressBar
              value={stats.todayXP || 0}
              max={stats.dailyGoal || 50}
              color="success"
              size="md"
            />
            {(stats.todayXP || 0) >= (stats.dailyGoal || 50) && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-success-500 mt-2 flex items-center gap-1"
              >
                <Star className="w-3 h-3" />
                {language === "fa"
                  ? "هدف امروز کامل شد! 🎉"
                  : "Daily goal completed! 🎉"}
              </motion.p>
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="default" padding="md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-500" />
              </div>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {language === "fa" ? "فعالیت هفتگی" : "Weekly Activity"}
              </p>
            </div>

            <div className="flex items-end justify-between gap-1 h-20">
              {weeklyActivity.length > 0 ? (
                weeklyActivity.slice(0, 7).map((day, index) => {
                  const xpValue = day.xp || day.count || 0;
                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center flex-1"
                    >
                      <motion.div
                        className="w-full bg-primary-200 dark:bg-primary-800 rounded-t-md"
                        initial={{ height: 0 }}
                        animate={{ height: `${(xpValue / maxXP) * 60}px` }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                      />
                      <span className="text-2xs text-neutral-400 mt-1">
                        {weekDays[language][index]}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="w-full text-center text-neutral-400 text-xs">
                  {language === "fa"
                    ? "هیچ فعالیتی این هفته ثبت نشده"
                    : "No activity this week"}
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ========== CONTINUE LEARNING ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-500" />
              {language === "fa" ? "ادامه یادگیری" : "Continue Learning"}
            </h2>
            <Link
              to="/learn"
              className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
            >
              {language === "fa" ? "مشاهده همه" : "View All"}
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </CardHeader>

          <CardBody>
            {recentLessons.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-500">
                  {language === "fa"
                    ? "هنوز درسی شروع نکردی!"
                    : "No lessons started yet!"}
                </p>
                <Link
                  to="/learn"
                  className="inline-block mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
                >
                  {language === "fa" ? "شروع یادگیری" : "Start Learning"}
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentLessons.map((lesson) => {
                  const isCompleted =
                    lesson.progress?.status === "completed" ||
                    lesson.progress?.status === "perfect";
                  const status = isCompleted ? "completed" : "available";

                  return (
                    <LessonCard
                      key={lesson.id}
                      lesson={{
                        id: lesson.id,
                        lessonNumber: lesson.lessonNumber,
                        title: lesson.title,
                        duration: lesson.estimatedMinutes || 20,
                        xpReward: lesson.xpReward || 50,
                        status: status,
                      }}
                      status={status}
                      onStart={() => navigate(`/lesson/${lesson.id}`)}
                    />
                  );
                })}
              </div>
            )}
          </CardBody>

          {nextLesson && (
            <CardFooter>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                <button
                  onClick={handleContinueLesson}
                  className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-all shadow-lg hover:shadow-xl text-base font-semibold"
                >
                  <BookOpen className="w-5 h-5" />
                  {language === "fa"
                    ? "ادامه آخرین درس"
                    : "Continue Last Lesson"}
                  <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-sm text-neutral-500">
                  {language === "fa"
                    ? `درس بعدی: ${nextLesson.title?.[language] || nextLesson.title?.fa || "بدون عنوان"}`
                    : `Next lesson: ${nextLesson.title?.[language] || nextLesson.title?.en || "Untitled"}`}
                </p>
              </div>
            </CardFooter>
          )}
        </Card>
      </motion.div>

      {/* ========== ACHIEVEMENTS & STATS ========== */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card variant="default" padding="lg">
            <CardHeader>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                {language === "fa" ? "دستاوردها" : "Achievements"}
              </h2>
            </CardHeader>

            <CardBody>
              <div className="grid grid-cols-2 gap-3">
                {achievements.length > 0 ? (
                  achievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      unlocked={achievement.isEarned || false}
                      progress={achievement.progress || 0}
                    />
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8 text-neutral-500">
                    <Trophy className="w-12 h-12 mx-auto mb-2 text-neutral-300" />
                    <p className="text-sm">
                      {language === "fa"
                        ? "هنوز دستاوردی کسب نکردی!"
                        : "No achievements yet!"}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      {language === "fa"
                        ? "با تکمیل درس‌ها دستاورد کسب کن!"
                        : "Complete lessons to earn achievements!"}
                    </p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card variant="default" padding="lg">
            <CardHeader>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-500" />
                {language === "fa" ? "آمار سریع" : "Quick Stats"}
              </h2>
            </CardHeader>

            <CardBody>
              <div className="grid grid-cols-2 gap-3">
                {quickStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                    >
                      <Card variant="bordered" padding="md">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                          {stat.value}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {stat.label[language]}
                        </p>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* ========== QUICK ACTIONS ========== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link key={index} to={action.path}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Card variant="bordered" padding="md" hover>
                  <div className="text-center">
                    <div
                      className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      {action.label[language]}
                    </p>
                  </div>
                </Card>
              </motion.div>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}

export default DashboardPage;
