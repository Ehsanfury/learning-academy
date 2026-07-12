/**
 * AdminDashboard.jsx
 * Path: src/pages/Admin/AdminDashboard.jsx
 * Description: Admin dashboard with real data
 * Changes:
 * - ✅ FIXED: Added debug logs for API calls
 * - ✅ FIXED: Better error handling
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
  Activity,
  AlertCircle,
  Loader2,
  RefreshCw,
  Star,
  Award,
} from "lucide-react";
import toast from "react-hot-toast";

const StatCard = ({ title, value, subtitle, icon: Icon, color, loading }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-24 mb-2" />
            <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-16" />
          </div>
          <div className="w-12 h-12 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {typeof value === "number" ? value.toLocaleString() : value || 0}
          </p>
          {subtitle && (
            <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const { language } = useLanguageContext();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalLessons: 0,
    totalAchievements: 0,
    totalXP: 0,
    lessonsCompletedToday: 0,
    newUsersToday: 0,
  });

  const [users, setUsers] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    console.log("📊 AdminDashboard mounted");
    loadAdminData();
  }, []);

  const loadAdminData = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log("🔄 Loading admin data...");

      // ✅ Get dashboard stats
      try {
        console.log("📊 Fetching /admin/dashboard...");
        const dashboardRes = await api.get("/admin/dashboard");
        console.log("📊 Dashboard response:", dashboardRes);

        const statsData = dashboardRes?.data?.data || dashboardRes?.data || {};
        setStats({
          totalUsers: statsData.totalUsers || 0,
          activeUsers: statsData.activeUsers || 0,
          totalLessons: statsData.totalLessons || 0,
          totalAchievements: statsData.totalAchievements || 0,
          totalXP: statsData.totalXP || 0,
          lessonsCompletedToday: statsData.lessonsCompletedToday || 0,
          newUsersToday: statsData.newUsersToday || 0,
        });
      } catch (e) {
        console.error("❌ Dashboard API error:", e);
      }

      // ✅ Get users
      try {
        console.log("👥 Fetching /admin/users...");
        const usersRes = await api.get("/admin/users");
        console.log("👥 Users response:", usersRes);
        const usersData = usersRes?.data?.data || usersRes?.data || [];
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (e) {
        console.error("❌ Users API error:", e);
      }

      // ✅ Get lessons
      try {
        console.log("📚 Fetching /admin/lessons...");
        const lessonsRes = await api.get("/admin/lessons");
        console.log("📚 Lessons response:", lessonsRes);
        const lessonsData = lessonsRes?.data?.data || lessonsRes?.data || [];
        setLessons(Array.isArray(lessonsData) ? lessonsData : []);
      } catch (e) {
        console.error("❌ Lessons API error:", e);
      }

      // ✅ Get activity
      try {
        console.log("📊 Fetching /admin/activity...");
        const activityRes = await api.get("/admin/activity");
        console.log("📊 Activity response:", activityRes);
        const activityData = activityRes?.data?.data || activityRes?.data || [];
        setRecentActivity(Array.isArray(activityData) ? activityData : []);
      } catch (e) {
        console.error("❌ Activity API error:", e);
      }

      console.log("✅ Admin data loaded successfully");
    } catch (error) {
      console.error("❌ Error loading admin data:", error);
      setError(error.message || "خطا در بارگذاری پنل مدیریت");
      toast.error("خطا در بارگذاری پنل مدیریت");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadAdminData(true);
  };

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
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
        >
          <RefreshCw className="w-4 h-4" />
          {language === "fa" ? "تلاش مجدد" : "Retry"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-primary-500" />
            {language === "fa" ? "پنل مدیریت" : "Admin Dashboard"}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            {language === "fa"
              ? `مدیریت ${stats.totalUsers || 0} کاربر و ${stats.totalLessons || 0} درس`
              : `Managing ${stats.totalUsers || 0} users and ${stats.totalLessons || 0} lessons`}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 transition disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
          />
          {language === "fa" ? "بروزرسانی" : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title={language === "fa" ? "کاربران کل" : "Total Users"}
          value={stats.totalUsers || 0}
          subtitle={`${stats.newUsersToday || 0} ${language === "fa" ? "جدید امروز" : "new today"}`}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title={language === "fa" ? "کاربران فعال" : "Active Users"}
          value={stats.activeUsers || 0}
          icon={Activity}
          color="bg-green-500"
        />
        <StatCard
          title={language === "fa" ? "کل درس‌ها" : "Total Lessons"}
          value={stats.totalLessons || 0}
          subtitle={`${stats.lessonsCompletedToday || 0} ${language === "fa" ? "تکمیل امروز" : "completed today"}`}
          icon={BookOpen}
          color="bg-purple-500"
        />
        <StatCard
          title={language === "fa" ? "کل XP" : "Total XP"}
          value={stats.totalXP || 0}
          icon={Star}
          color="bg-amber-500"
        />
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
          {language === "fa" ? "آمار تکمیلی" : "Additional Stats"}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <p className="text-2xl font-bold text-amber-500">
              {stats.totalAchievements || 0}
            </p>
            <p className="text-xs text-neutral-500">
              {language === "fa" ? "دستاوردها" : "Achievements"}
            </p>
          </div>
          <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <p className="text-2xl font-bold text-green-500">
              {stats.totalUsers > 0
                ? `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}%`
                : "0%"}
            </p>
            <p className="text-xs text-neutral-500">
              {language === "fa" ? "نرخ فعالیت" : "Activity Rate"}
            </p>
          </div>
          <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <p className="text-2xl font-bold text-blue-500">
              {stats.totalUsers > 0
                ? Math.round(stats.totalXP / stats.totalUsers)
                : 0}
            </p>
            <p className="text-xs text-neutral-500">
              {language === "fa" ? "میانگین XP" : "Avg XP"}
            </p>
          </div>
          <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <p className="text-2xl font-bold text-purple-500">
              {stats.lessonsCompletedToday || 0}
            </p>
            <p className="text-xs text-neutral-500">
              {language === "fa" ? "درس امروز" : "Today's Lessons"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800">
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
            {language === "fa" ? "کاربران اخیر" : "Recent Users"}
          </h3>
          {users.length === 0 ? (
            <p className="text-sm text-neutral-500">
              {language === "fa" ? "هیچ کاربری یافت نشد" : "No users found"}
            </p>
          ) : (
            <div className="space-y-2">
              {users.slice(0, 5).map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {user.name || "بدون نام"}
                    </p>
                    <p className="text-xs text-neutral-500">{user.email}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${user.role === "admin" ? "bg-purple-100 text-purple-600" : "bg-neutral-100 text-neutral-600"}`}
                  >
                    {user.role || "user"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800">
          <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-4">
            {language === "fa" ? "درس‌های اخیر" : "Recent Lessons"}
          </h3>
          {lessons.length === 0 ? (
            <p className="text-sm text-neutral-500">
              {language === "fa" ? "هیچ درسی یافت نشد" : "No lessons found"}
            </p>
          ) : (
            <div className="space-y-2">
              {lessons.slice(0, 5).map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {typeof lesson.title === "object"
                        ? lesson.title?.[language] ||
                          lesson.title?.fa ||
                          "بدون عنوان"
                        : lesson.title || "بدون عنوان"}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {lesson.level || "A1"} • {lesson.xpReward || 50} XP
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${lesson.status === "published" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"}`}
                  >
                    {lesson.status || "draft"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
