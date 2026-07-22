/**
 * DashboardPage.jsx
 * Path: src/pages/Dashboard/DashboardPage.jsx
 * Description: Dashboard page with real data from API
 * Version: 7.1 - Fixed lessonApi usage
 * Changes:
 * - ✅ FIXED: lessonApi.getLessons → lessonApi.getAllLessons
 * - ✅ Better XP card with progress to next level
 * - ✅ Weekly activity chart (bar chart)
 * - ✅ Achievements preview
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
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Calendar,
  ArrowLeft,
  Headphones,
  Sparkles,
} from "lucide-react";
import XPCard from "../../components/XPCard";
import AchievementCard from "../../components/AchievementCard";
import LessonCard from "../../components/LessonCard";
import ProgressBar from "../../components/ProgressBar";
import Card, {
  CardHeader,
  CardBody,
  CardFooter,
} from "../../components/ui/Card";
import Skeleton from "../../components/ui/Skeleton";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";

// ============================================
// 📊 Level Thresholds
// ============================================

const LEVEL_THRESHOLDS = [
  { level: 1, minXP: 0, maxXP: 99 },
  { level: 2, minXP: 100, maxXP: 249 },
  { level: 3, minXP: 250, maxXP: 499 },
  { level: 4, minXP: 500, maxXP: 999 },
  { level: 5, minXP: 1000, maxXP: 1999 },
  { level: 6, minXP: 2000, maxXP: 3499 },
  { level: 7, minXP: 3500, maxXP: 4999 },
  { level: 8, minXP: 5000, maxXP: 7499 },
  { level: 9, minXP: 7500, maxXP: 9999 },
  { level: 10, minXP: 10000, maxXP: Infinity },
];

const getNextLevelXP = (currentLevel) => {
  const next = LEVEL_THRESHOLDS.find(
    (t) => t.level === (currentLevel || 1) + 1,
  );
  return next ? next.minXP : (currentLevel || 1) * 1000;
};

const getCurrentLevelXP = (currentLevel) => {
  const cur = LEVEL_THRESHOLDS.find((t) => t.level === (currentLevel || 1));
  return cur ? cur.minXP : 0;
};

// ============================================
// 📊 Skeleton
// ============================================

const DashboardSkeleton = () => (
  <div data-testid="dashboard-skeleton" className="space-y-6">
    <Skeleton variant="title" />
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Skeleton variant="card" count={4} />
    </div>
    <div className="grid lg:grid-cols-3 gap-6">
      <Skeleton variant="cardLg" className="lg:col-span-2" />
      <Skeleton variant="cardLg" />
    </div>
  </div>
);

// ============================================
// 🔄 DashboardPage Component
// ============================================

const DashboardPage = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { user } = useAuth();

  // ============================================
  // 📊 State
  // ============================================

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalLessons: 0,
    completedLessons: 0,
    totalXP: user?.xp || 0,
    weeklyActivity: [],
  });
  const [recentLessons, setRecentLessons] = useState([]);
  const [recentAchievements, setRecentAchievements] = useState([]);

  // ============================================
  // 📡 Fetch Dashboard Data
  // ============================================

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // ✅ FIXED: استفاده از getAllLessons به جای getLessons
      const [statsResponse, lessonsResponse, achievementsResponse] =
        await Promise.allSettled([
          api.get("/progress/dashboard"),
          lessonApi.getAllLessons({ limit: 5 }),
          api.get("/achievements/recent"),
        ]);

      // Stats
      if (
        statsResponse.status === "fulfilled" &&
        statsResponse.value?.data?.success
      ) {
        const data = statsResponse.value.data.data;
        setStats({
          totalLessons: data.totalLessons || 0,
          completedLessons: data.completedLessons || 0,
          totalXP: data.totalXP || user?.xp || 0,
          weeklyActivity: data.weeklyActivity || [],
        });
      }

      // Lessons
      if (
        lessonsResponse.status === "fulfilled" &&
        lessonsResponse.value?.data?.data?.lessons
      ) {
        setRecentLessons(lessonsResponse.value.data.data.lessons.slice(0, 5));
      } else if (
        lessonsResponse.status === "fulfilled" &&
        lessonsResponse.value?.data?.lessons
      ) {
        setRecentLessons(lessonsResponse.value.data.lessons.slice(0, 5));
      }

      // Achievements
      if (
        achievementsResponse.status === "fulfilled" &&
        achievementsResponse.value?.data?.success
      ) {
        setRecentAchievements(achievementsResponse.value.data.data || []);
      }
    } catch (err) {
      debug.error("Dashboard fetch error:", err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ============================================
  // 📊 Computed Values
  // ============================================

  const userLevel = user?.level || 1;
  const userXP = user?.xp || 0;
  const nextLevelXP = getNextLevelXP(userLevel);
  const currentLevelXP = getCurrentLevelXP(userLevel);
  const levelProgress = Math.min(
    100,
    Math.round(
      ((userXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100,
    ),
  );

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "صبح بخیر";
    if (hour < 17) return "ظهر بخیر";
    if (hour < 20) return "عصر بخیر";
    return "شب بخیر";
  }, []);

  // ============================================
  // 📊 Weekly Activity Chart Data
  // ============================================

  const weeklyChartData = useMemo(() => {
    if (stats.weeklyActivity.length === 0) {
      const days = ["ش", "ی", "د", "س", "چ", "پ", "ج"];
      return days.map((day) => ({ day, xp: 0 }));
    }
    return stats.weeklyActivity;
  }, [stats.weeklyActivity]);

  const maxWeeklyXP = Math.max(...weeklyChartData.map((d) => d.xp || 0), 100);

  // ============================================
  // 🖼️ Render
  // ============================================

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <ErrorState
          error={error}
          onRetry={fetchDashboardData}
          title="خطا در بارگذاری داشبورد"
          message="بارگذاری اطلاعات داشبورد ناموفق بود. لطفاً دوباره تلاش کنید."
          showDetails
          size="lg"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {greeting}، {user?.name?.split(" ")[0] || ""} 👋
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {language === "fa"
              ? "بیایید امروز هم یاد بگیریم!"
              : "Let's learn today!"}
          </p>
        </div>

        <Button
          variant="primary"
          icon={Sparkles}
          onClick={() => navigate("/learn")}
        >
          {language === "fa" ? "شروع یادگیری" : "Start Learning"}
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* XP Card */}
        <Card
          hover
          className="bg-gradient-to-br from-primary-500 to-accent-500 text-white border-0"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 text-sm">سطح</p>
              <p className="text-3xl font-bold mt-1">{userLevel}</p>
            </div>
            <div className="p-2 bg-white/20 rounded-lg">
              <Zap className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span>{userXP} XP</span>
              <span>{nextLevelXP} XP</span>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-white rounded-full"
              />
            </div>
          </div>
        </Card>

        {/* Streak */}
        <Card hover>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-neutral-500 text-sm">گل‌زنی</p>
              <p className="text-3xl font-bold mt-1 text-neutral-900 dark:text-neutral-100">
                {user?.streak || 0}
              </p>
              <p className="text-xs text-neutral-400 mt-1">روز</p>
            </div>
            <div className="p-2 bg-warning-100 dark:bg-warning-950 rounded-lg">
              <Flame className="w-6 h-6 text-warning-500" />
            </div>
          </div>
        </Card>

        {/* Lessons Done */}
        <Card hover>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-neutral-500 text-sm">درس تکمیل شده</p>
              <p className="text-3xl font-bold mt-1 text-neutral-900 dark:text-neutral-100">
                {stats.completedLessons}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                از {stats.totalLessons} درس
              </p>
            </div>
            <div className="p-2 bg-success-100 dark:bg-success-950 rounded-lg">
              <CheckCircle className="w-6 h-6 text-success-500" />
            </div>
          </div>
        </Card>

        {/* Total XP */}
        <Card hover>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-neutral-500 text-sm">کل XP</p>
              <p className="text-3xl font-bold mt-1 text-neutral-900 dark:text-neutral-100">
                {userXP}
              </p>
              <p className="text-xs text-neutral-400 mt-1">امتیاز</p>
            </div>
            <div className="p-2 bg-primary-100 dark:bg-primary-950 rounded-lg">
              <Star className="w-6 h-6 text-primary-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-bold">ادامه یادگیری</h2>
            </div>
            <Link
              to="/learn"
              className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
            >
              مشاهده همه
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </CardHeader>

          <CardBody>
            {recentLessons.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="هنوز درسی شروع نکرده‌اید"
                description="اولین درس خود را شروع کنید و سفر یادگیری را آغاز کنید!"
                actionLabel="شروع یادگیری"
                onAction={() => navigate("/learn")}
                size="sm"
              />
            ) : (
              <div className="space-y-3">
                {recentLessons.map((lesson, index) => (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <LessonCard lesson={lesson} />
                  </motion.div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Weekly Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-success-500" />
              <h2 className="text-lg font-bold">فعالیت هفتگی</h2>
            </div>
          </CardHeader>

          <CardBody>
            <div className="flex items-end justify-between gap-2 h-40 mb-4">
              {weeklyChartData.map((item, index) => {
                const height = Math.max(
                  4,
                  ((item.xp || 0) / maxWeeklyXP) * 100,
                );
                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <span className="text-xs text-neutral-400">
                      {item.xp > 0 ? item.xp : ""}
                    </span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="w-full bg-gradient-to-t from-primary-500 to-accent-500 rounded-t-md min-h-[4px]"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-neutral-500">
                      {item.day?.charAt(0) || ""}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
              <div className="flex justify-between items-center">
                <span className="text-sm text-neutral-500">میانگین روزانه</span>
                <span className="font-bold text-primary-500">
                  {Math.round(
                    weeklyChartData.reduce((sum, d) => sum + (d.xp || 0), 0) /
                      7,
                  )}{" "}
                  XP
                </span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Achievements & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Achievements */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-warning-500" />
              <h2 className="text-lg font-bold">دستاوردها</h2>
            </div>
            <Link
              to="/achievements"
              className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
            >
              مشاهده همه
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </CardHeader>

          <CardBody>
            {recentAchievements.length === 0 ? (
              <EmptyState
                icon={Trophy}
                title="هنوز دستاوردی کسب نکرده‌اید"
                description="با ادامه یادگیری، دستاوردهای جدیدی باز خواهد شد!"
                size="sm"
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {recentAchievements.slice(0, 6).map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <AchievementCard achievement={achievement} compact />
                  </motion.div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-bold">دسترسی سریع</h2>
            </div>
          </CardHeader>

          <CardBody className="space-y-2">
            <QuickAction
              icon={Zap}
              label="تمرین سریع"
              to="/practice"
              color="primary"
            />
            <QuickAction
              icon={Headphones}
              label="چت با AI"
              to="/ai-tutor"
              color="accent"
            />
            <QuickAction
              icon={BookOpen}
              label="داستان روز"
              to="/stories"
              color="success"
            />
            <QuickAction
              icon={Target}
              label="دیکشنری"
              to="/dictionary"
              color="warning"
            />
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

// ============================================
// ⚡ QuickAction Component
// ============================================

const QuickAction = ({ icon: Icon, label, to, color = "primary" }) => {
  const colorClasses = {
    primary: "bg-primary-100 dark:bg-primary-950 text-primary-500",
    accent: "bg-accent-100 dark:bg-accent-950 text-accent-500",
    success: "bg-success-100 dark:bg-success-950 text-success-500",
    warning: "bg-warning-100 dark:bg-warning-950 text-warning-500",
  };

  return (
    <Link to={to}>
      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer group">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="flex-1 text-sm font-medium">{label}</span>
        <ArrowLeft className="w-4 h-4 text-neutral-400 group-hover:text-primary-500 transition-colors" />
      </div>
    </Link>
  );
};

export default DashboardPage;
