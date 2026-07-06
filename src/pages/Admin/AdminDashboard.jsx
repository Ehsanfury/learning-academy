/**
 * AdminDashboard.jsx
 * Path: src/pages/Admin/AdminDashboard.jsx
 * Description: Admin dashboard for content and user management
 * Changes:
 * - ✅ FIXED: Duplicate imports removed (Zap, Flame)
 * - ✅ Cleaned up import list
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@context/AuthContext";
import { useLanguageContext } from "@context/LanguageContext";
import api from "@services/api";
import debug from "../../utils/debug";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Settings,
  BarChart3,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  Star,
  Crown,
  Medal,
  Award,
  MessageSquare,
  Bot,
  Globe,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

// ============================================
// 📊 Admin Dashboard
// ============================================

const AdminDashboard = () => {
  const { user } = useAuth();
  const { language } = useLanguageContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalLessons: 0,
    totalAchievements: 0,
    totalXP: 0,
    totalStreak: 0,
    newUsersToday: 0,
    lessonsCompletedToday: 0,
  });
  const [users, setUsers] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // ============================================
  // 📥 Load Data
  // ============================================

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check admin role
      if (user?.role !== "admin") {
        setError(
          language === "fa"
            ? "شما دسترسی به این بخش ندارید"
            : "You don't have access to this section",
        );
        setLoading(false);
        return;
      }

      // Get stats
      try {
        const statsRes = await api.get("/admin/stats");
        setStats(statsRes?.data || statsRes || {});
      } catch (e) {}

      // Get users
      try {
        const usersRes = await api.get("/admin/users");
        setUsers(usersRes?.data?.data || usersRes?.data || []);
      } catch (e) {}

      // Get lessons
      try {
        const lessonsRes = await api.get("/admin/lessons");
        setLessons(lessonsRes?.data?.data || lessonsRes?.data || []);
      } catch (e) {}

      // Get recent activity
      try {
        const activityRes = await api.get("/admin/activity");
        setRecentActivity(activityRes?.data || []);
      } catch (e) {}
    } catch (error) {
      debug.error("Error loading admin data:", error);
      setError(error.message || "خطا در بارگذاری پنل مدیریت");
      toast.error("خطا در بارگذاری پنل مدیریت");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 🖼️ Render Functions
  // ============================================

  const renderStatCard = (title, value, Icon, color, subtitle = null) => (
    <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500">{title}</p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );

  // ============================================
  // 🖼️ Main Render
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <p className="text-neutral-500 dark:text-neutral-400">{error}</p>
        {user?.role !== "admin" && (
          <p className="text-sm text-neutral-400">
            {language === "fa"
              ? "برای دسترسی به پنل مدیریت باید نقش ادمین داشته باشید"
              : "You need admin role to access the admin panel"}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-primary-500" />
              {language === "fa" ? "📊 پنل مدیریت" : "📊 Admin Dashboard"}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">
              {language === "fa"
                ? "مدیریت کاربران، محتوا و آمار سیستم"
                : "Manage users, content and system statistics"}
            </p>
          </div>
          <button
            onClick={loadAdminData}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 transition"
          >
            <RefreshCw className="w-4 h-4" />
            {language === "fa" ? "بروزرسانی" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {renderStatCard(
          language === "fa" ? "کاربران کل" : "Total Users",
          stats.totalUsers || 0,
          Users,
          "bg-blue-500",
          `${stats.newUsersToday || 0} ${language === "fa" ? "جدید امروز" : "new today"}`,
        )}
        {renderStatCard(
          language === "fa" ? "کاربران فعال" : "Active Users",
          stats.activeUsers || 0,
          Activity,
          "bg-green-500",
        )}
        {renderStatCard(
          language === "fa" ? "کل درس‌ها" : "Total Lessons",
          stats.totalLessons || 0,
          BookOpen,
          "bg-purple-500",
          `${stats.lessonsCompletedToday || 0} ${language === "fa" ? "تکمیل امروز" : "completed today"}`,
        )}
        {renderStatCard(
          language === "fa" ? "کل XP" : "Total XP",
          (stats.totalXP || 0).toLocaleString(),
          null,
          "bg-amber-500",
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        {[
          {
            id: "overview",
            label: { fa: "نمای کلی", en: "Overview" },
            icon: BarChart3,
          },
          { id: "users", label: { fa: "کاربران", en: "Users" }, icon: Users },
          {
            id: "lessons",
            label: { fa: "درس‌ها", en: "Lessons" },
            icon: BookOpen,
          },
          {
            id: "activity",
            label: { fa: "فعالیت", en: "Activity" },
            icon: Activity,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                isActive
                  ? "bg-primary-500 text-white"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label[language]}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 text-center">
              <p className="text-2xl font-bold text-amber-500">
                {stats.totalStreak || 0}
              </p>
              <p className="text-xs text-neutral-500">
                {language === "fa" ? "گل‌زنی کل" : "Total Streak"}
              </p>
            </div>
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 text-center">
              <p className="text-2xl font-bold text-green-500">
                {stats.totalAchievements || 0}
              </p>
              <p className="text-xs text-neutral-500">
                {language === "fa" ? "دستاوردها" : "Achievements"}
              </p>
            </div>
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 text-center">
              <p className="text-2xl font-bold text-blue-500">
                {stats.totalUsers > 0
                  ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
                  : 0}
                %
              </p>
              <p className="text-xs text-neutral-500">
                {language === "fa" ? "نرخ فعالیت" : "Activity Rate"}
              </p>
            </div>
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 text-center">
              <p className="text-2xl font-bold text-purple-500">
                {stats.totalUsers > 0
                  ? Math.round(stats.totalXP / stats.totalUsers)
                  : 0}
              </p>
              <p className="text-xs text-neutral-500">
                {language === "fa" ? "میانگین XP" : "Avg XP"}
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800">
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
              {language === "fa" ? "فعالیت‌های اخیر" : "Recent Activity"}
            </h3>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-neutral-500">
                {language === "fa"
                  ? "هیچ فعالیتی ثبت نشده"
                  : "No recent activity"}
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 10).map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <span className="text-neutral-500">
                      {activity.icon || "📚"}
                    </span>
                    <span className="flex-1 text-neutral-700 dark:text-neutral-300">
                      {activity.description?.[language] || activity.description}
                    </span>
                    <span className="text-xs text-neutral-400">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              {language === "fa" ? "لیست کاربران" : "User List"}
            </h3>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-neutral-100 transition">
                <Download className="w-4 h-4 text-neutral-500" />
              </button>
            </div>
          </div>
          {users.length === 0 ? (
            <p className="text-sm text-neutral-500">
              {language === "fa" ? "هیچ کاربری یافت نشد" : "No users found"}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-700">
                    <th className="text-left py-2 px-3 text-neutral-500">
                      {language === "fa" ? "نام" : "Name"}
                    </th>
                    <th className="text-left py-2 px-3 text-neutral-500">
                      Email
                    </th>
                    <th className="text-center py-2 px-3 text-neutral-500">
                      XP
                    </th>
                    <th className="text-center py-2 px-3 text-neutral-500">
                      {language === "fa" ? "سطح" : "Level"}
                    </th>
                    <th className="text-center py-2 px-3 text-neutral-500">
                      {language === "fa" ? "گل‌زنی" : "Streak"}
                    </th>
                    <th className="text-center py-2 px-3 text-neutral-500">
                      {language === "fa" ? "نقش" : "Role"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition"
                    >
                      <td className="py-2 px-3 font-medium">{user.name}</td>
                      <td className="py-2 px-3 text-neutral-500">
                        {user.email}
                      </td>
                      <td className="py-2 px-3 text-center font-bold">
                        {user.xp || 0}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {user.level || 1}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {user.streak || 0}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            user.role === "admin"
                              ? "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400"
                              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                          }`}
                        >
                          {user.role || "user"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "lessons" && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              {language === "fa" ? "مدیریت درس‌ها" : "Lesson Management"}
            </h3>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition">
              <Plus className="w-4 h-4" />
              {language === "fa" ? "درس جدید" : "New Lesson"}
            </button>
          </div>
          {lessons.length === 0 ? (
            <p className="text-sm text-neutral-500">
              {language === "fa" ? "هیچ درسی یافت نشد" : "No lessons found"}
            </p>
          ) : (
            <div className="space-y-2">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {lesson.title?.[language] ||
                        lesson.title?.fa ||
                        "بدون عنوان"}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                      <span>{lesson.level || "A1"}</span>
                      <span>•</span>
                      <span>
                        {language === "fa" ? "درس" : "Lesson"}{" "}
                        {lesson.lessonNumber}
                      </span>
                      <span>•</span>
                      <span>{lesson.xpReward || 50} XP</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-neutral-200 transition">
                      <Edit className="w-4 h-4 text-neutral-500" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-red-100 transition">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "activity" && (
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800">
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
            {language === "fa" ? "گزارش فعالیت" : "Activity Report"}
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <p className="text-sm text-neutral-500">
                  {language === "fa"
                    ? "درس‌های تکمیل شده امروز"
                    : "Lessons Completed Today"}
                </p>
                <p className="text-2xl font-bold text-green-500">
                  {stats.lessonsCompletedToday || 0}
                </p>
              </div>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                <p className="text-sm text-neutral-500">
                  {language === "fa" ? "کاربران جدید امروز" : "New Users Today"}
                </p>
                <p className="text-2xl font-bold text-blue-500">
                  {stats.newUsersToday || 0}
                </p>
              </div>
            </div>
            <div className="h-32 bg-neutral-50 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
              <p className="text-sm text-neutral-400">
                {language === "fa"
                  ? "نمودار فعالیت در اینجا نمایش داده می‌شود"
                  : "Activity chart will be displayed here"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
