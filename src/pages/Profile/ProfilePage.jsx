/**
 * ProfilePage.jsx
 * Path: src/pages/Profile/ProfilePage.jsx
 * Description: User profile with stats, achievements and settings
 * Version: 4.0 - Fixed recentActivity array handling
 * Changes:
 * - ✅ Fixed: recentActivity.map is not a function
 * - ✅ Fixed: Empty state for recent activity
 * - ✅ Fixed: Proper array checks
 */

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@context/AuthContext";
import { useLanguageContext } from "@context/LanguageContext";
import api from "@services/api";
import {
  User,
  Mail,
  Award,
  Zap,
  Flame,
  BookOpen,
  Star,
  Trophy,
  Crown,
  Medal,
  Calendar,
  Clock,
  TrendingUp,
  Users,
  Settings,
  Edit,
  Camera,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Sparkles,
  GraduationCap,
  Globe,
  Languages,
  MapPin,
  Briefcase,
  Heart,
  Share2,
  Twitter,
  Github,
  Linkedin,
} from "lucide-react";
import toast from "react-hot-toast";

// ✅ استفاده از کامپوننت‌های جدید UI
import { Card, CardHeader, CardBody, CardFooter } from "@components/ui";
import Button from "@components/ui/Button";
import Badge from "@components/ui/Badge";
import Skeleton from "@components/ui/Skeleton";
import Input from "@components/ui/Input";

// ============================================
// 📊 Skeleton Components
// ============================================

const ProfileSkeleton = () => (
  <div className="max-w-6xl mx-auto px-4 py-8">
    <div className="mb-8">
      <Skeleton variant="title" className="w-48" />
      <Skeleton variant="subtitle" className="w-64 mt-1" />
    </div>

    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <Card className="text-center">
          <div className="flex flex-col items-center">
            <Skeleton variant="avatar" className="w-24 h-24" />
            <Skeleton variant="title" className="w-32 mt-4" />
            <Skeleton variant="text" className="w-48 mt-2" />
            <Skeleton variant="text" className="w-48 mt-1" />
            <Skeleton variant="button" className="w-32 mt-4" />
          </div>
        </Card>

        <Card>
          <Skeleton variant="title" className="w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton variant="text" className="w-20" />
                <Skeleton variant="text" className="w-16" />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <Skeleton variant="title" className="w-32 mb-4" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="avatar" className="w-10 h-10" />
            ))}
          </div>
        </Card>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <Card>
          <div className="flex justify-between mb-4">
            <Skeleton variant="title" className="w-48" />
            <Skeleton variant="avatar" className="w-10 h-10" />
          </div>
          <Skeleton variant="bar" className="h-3" />
          <Skeleton variant="text" className="w-32 mt-2" />
        </Card>

        <div className="grid grid-cols-2 gap-4">
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

        <Card>
          <Skeleton variant="title" className="w-32 mb-4" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <Skeleton variant="avatar" className="w-8 h-8" />
              <Skeleton variant="text" className="flex-1" />
              <Skeleton variant="text" className="w-20" />
            </div>
          ))}
        </Card>

        <Card>
          <Skeleton variant="title" className="w-32 mb-4" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton variant="text" className="w-20" />
                <Skeleton variant="text" className="w-32" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  </div>
);

// ============================================
// 📊 ProfilePage Component
// ============================================

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { language } = useLanguageContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // ============================================
  // 📥 Load Profile Data
  // ============================================

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Get user profile
      const profileRes = await api.get("/users/profile");
      const profileData = profileRes?.data || profileRes;
      setProfile(profileData);
      setEditData(profileData);

      // 2. Get user stats
      try {
        const statsRes = await api.get("/users/stats");
        setStats(statsRes?.data || statsRes);
      } catch (e) {
        console.warn("Could not fetch stats:", e);
        setStats(null);
      }

      // 3. Get achievements
      try {
        const achRes = await api.get("/achievements");
        const achData = achRes?.data?.data || achRes?.data || [];
        // Normalize: backend returns `earned`, UI expects `isEarned`
        const normalized = (Array.isArray(achData) ? achData : []).map((a) => ({
          ...a,
          isEarned: a.earned ?? a.isEarned ?? false,
        }));
        setAchievements(normalized.filter((a) => a.isEarned));
      } catch (e) {
        console.warn("Could not fetch achievements:", e);
        setAchievements([]);
      }

      // 4. Get recent activity
      // ✅ FIXED: Ensure recentActivity is always an array
      try {
        const activityRes = await api.get("/users/activity");
        const activityData = activityRes?.data || activityRes || [];
        setRecentActivity(Array.isArray(activityData) ? activityData : []);
      } catch (e) {
        console.warn("Could not fetch activity:", e);
        setRecentActivity([]);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      setError(error.message || "خطا در بارگذاری پروفایل");
      toast.error("خطا در بارگذاری پروفایل");
      // ✅ FIXED: Set empty array on error
      setRecentActivity([]);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // ✏️ Edit Profile
  // ============================================

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(profile);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData(profile);
  };

  const handleSaveEdit = async () => {
    try {
      setIsSaving(true);

      const response = await api.put("/users/profile", editData);
      const updatedUser = response?.data || response;

      setProfile(updatedUser);
      updateUser(updatedUser);
      setIsEditing(false);
      toast.success("پروفایل با موفقیت به‌روزرسانی شد");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("خطا در به‌روزرسانی پروفایل");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  // ============================================
  // 🛠️ Helper Functions
  // ============================================

  const getLevelColor = (level) => {
    const colors = {
      1: "from-green-400 to-green-600",
      2: "from-blue-400 to-blue-600",
      3: "from-amber-400 to-amber-600",
      4: "from-orange-400 to-orange-600",
      5: "from-red-400 to-red-600",
      6: "from-purple-400 to-purple-600",
    };
    return colors[Math.min(level || 1, 6)] || "from-gray-400 to-gray-600";
  };

  const getLevelEmoji = (level) => {
    const emojis = {
      1: "🌱",
      2: "🌿",
      3: "🌳",
      4: "🌲",
      5: "🏔️",
      6: "🗻",
    };
    return emojis[Math.min(level || 1, 6)] || "📚";
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString(language === "fa" ? "fa-IR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // ============================================
  // 📊 Computed Values
  // ============================================

  const quickStats = [
    {
      icon: BookOpen,
      label: { fa: "کل درس‌ها", en: "Total Lessons" },
      value: stats?.totalLessons || 0,
      color: "from-blue-400 to-blue-600",
    },
    {
      icon: CheckCircle,
      label: { fa: "تکمیل شده", en: "Completed" },
      value: stats?.completedLessons || 0,
      color: "from-green-400 to-green-600",
    },
    {
      icon: Star,
      label: { fa: "نمره عالی", en: "Perfect" },
      value: stats?.perfectLessons || 0,
      color: "from-amber-400 to-amber-600",
    },
    {
      icon: Target,
      label: { fa: "در حال پیشرفت", en: "In Progress" },
      value: stats?.inProgress || 0,
      color: "from-orange-400 to-orange-600",
    },
  ];

  // ============================================
  // 🖼️ Main Render
  // ============================================

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="w-16 h-16 text-danger-500" />
        <p className="text-neutral-500 dark:text-neutral-400">
          {error || "پروفایل یافت نشد"}
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={loadProfileData}
          icon={RefreshCw}
        >
          {language === "fa" ? "تلاش مجدد" : "Retry"}
        </Button>
      </div>
    );
  }

  const level = profile.level || 1;
  const xp = profile.xp || 0;
  const nextLevelXP = level * 500;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* ========== HEADER ========== */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <User className="w-6 h-6 text-primary-500" />
          {language === "fa" ? "👤 پروفایل" : "👤 Profile"}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          {language === "fa"
            ? "اطلاعات شخصی و آمار یادگیری شما"
            : "Your personal information and learning statistics"}
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ========== LEFT COLUMN ========== */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="elevated" padding="lg" className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-3xl font-bold text-white mx-auto">
                  {profile.name?.charAt(0) || "U"}
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition">
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {isEditing ? (
                <div className="mt-4 space-y-3">
                  <Input
                    value={editData.name || ""}
                    onChange={(e) => handleEditChange("name", e.target.value)}
                    placeholder={language === "fa" ? "نام کامل" : "Full name"}
                    size="sm"
                  />
                  <Input
                    value={editData.bio || ""}
                    onChange={(e) => handleEditChange("bio", e.target.value)}
                    placeholder={language === "fa" ? "بیوگرافی" : "Bio"}
                    size="sm"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                      isLoading={isSaving}
                      icon={CheckCircle}
                      fullWidth
                    >
                      {language === "fa" ? "ذخیره" : "Save"}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      {language === "fa" ? "لغو" : "Cancel"}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-4">
                    {profile.name}
                  </h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {profile.bio ||
                      (language === "fa"
                        ? "عاشق یادگیری زبان آلمانی"
                        : "Love learning German")}
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-2 text-sm text-neutral-500">
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleEdit}
                    icon={Edit}
                    className="mt-4 mx-auto"
                  >
                    {language === "fa" ? "ویرایش پروفایل" : "Edit Profile"}
                  </Button>
                </>
              )}
            </Card>
          </motion.div>

          {/* Stats Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="bordered" padding="lg">
              <CardHeader>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  📊 {language === "fa" ? "آمار سریع" : "Quick Stats"}
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500">
                      {language === "fa" ? "امتیاز" : "XP"}
                    </span>
                    <span className="font-bold text-neutral-900 dark:text-neutral-100">
                      {xp}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500">
                      {language === "fa" ? "سطح" : "Level"}
                    </span>
                    <Badge variant="primary">{level}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500">
                      {language === "fa" ? "گل‌زنی" : "Streak"}
                    </span>
                    <Badge variant="warning" dot>
                      {stats?.streak || 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500">
                      {language === "fa" ? "درس تکمیل شده" : "Lessons Done"}
                    </span>
                    <Badge variant="success">
                      {stats?.completedLessons || 0}/{stats?.totalLessons || 0}
                    </Badge>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="bordered" padding="lg">
              <CardHeader>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                  🏆 {language === "fa" ? "دستاوردها" : "Achievements"}
                </h3>
                <span className="text-xs text-neutral-500">
                  {achievements.length}{" "}
                  {language === "fa" ? "کسب شده" : "earned"}
                </span>
              </CardHeader>
              <CardBody>
                <div className="flex flex-wrap gap-2">
                  {achievements.slice(0, 8).map((ach) => (
                    <div
                      key={ach.id}
                      className="p-2 bg-amber-50 dark:bg-amber-950 rounded-lg text-center"
                      title={ach.name?.[language] || ach.name}
                    >
                      <span className="text-2xl">{ach.icon || "🏆"}</span>
                    </div>
                  ))}
                  {achievements.length === 0 && (
                    <p className="text-sm text-neutral-500 w-full text-center py-4">
                      {language === "fa"
                        ? "هنوز دستاوردی کسب نکردی"
                        : "No achievements yet"}
                    </p>
                  )}
                  {achievements.length > 8 && (
                    <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-center">
                      <span className="text-sm font-medium text-neutral-500">
                        +{achievements.length - 8}
                      </span>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>

        {/* ========== RIGHT COLUMN ========== */}
        <div className="lg:col-span-2 space-y-6">
          {/* XP Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="bordered" padding="lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    {language === "fa"
                      ? "پیشرفت به سطح بعدی"
                      : "Progress to Next Level"}
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {language === "fa"
                      ? `${xp} از ${nextLevelXP} XP`
                      : `${xp} of ${nextLevelXP} XP`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getLevelEmoji(level)}</span>
                  <span className="text-lg font-bold text-primary-500">
                    {level}
                  </span>
                </div>
              </div>
              <div className="w-full h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getLevelColor(level)} rounded-full transition-all duration-500`}
                  style={{
                    width: `${Math.min((xp / nextLevelXP) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-neutral-400 mt-2 text-right">
                {language === "fa"
                  ? `${Math.min(Math.round((xp / nextLevelXP) * 100), 100)}% تکمیل`
                  : `${Math.min(Math.round((xp / nextLevelXP) * 100), 100)}% complete`}
              </p>
            </Card>
          </motion.div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-4">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <Card variant="bordered" padding="md">
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
                </motion.div>
              );
            })}
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card variant="bordered" padding="lg">
              <CardHeader>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {language === "fa" ? "فعالیت‌های اخیر" : "Recent Activity"}
                </h3>
              </CardHeader>
              <CardBody>
                {/* ✅ FIXED: Check if recentActivity is an array */}
                {!Array.isArray(recentActivity) ||
                recentActivity.length === 0 ? (
                  <p className="text-sm text-neutral-500">
                    {language === "fa"
                      ? "هنوز فعالیتی ثبت نشده"
                      : "No recent activity"}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 text-sm"
                      >
                        <span className="text-neutral-500">
                          {activity.icon || "📚"}
                        </span>
                        <span className="flex-1 text-neutral-700 dark:text-neutral-300">
                          {activity.description?.[language] ||
                            activity.description ||
                            "فعالیت"}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {formatDate(activity.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>

          {/* Account Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Card variant="bordered" padding="lg">
              <CardHeader>
                <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  {language === "fa" ? "اطلاعات حساب" : "Account Info"}
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">
                      {language === "fa" ? "ایمیل" : "Email"}
                    </span>
                    <span className="text-neutral-900 dark:text-neutral-100">
                      {profile.email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">
                      {language === "fa" ? "عضو از" : "Member since"}
                    </span>
                    <span className="text-neutral-900 dark:text-neutral-100">
                      {formatDate(profile.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">
                      {language === "fa" ? "نقش" : "Role"}
                    </span>
                    <Badge variant="secondary">{profile.role || "user"}</Badge>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
