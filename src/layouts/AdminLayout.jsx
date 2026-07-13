/**
 * AdminLayout.jsx
 * Path: src/layouts/AdminLayout.jsx
 * Description: Admin panel layout with sidebar
 * Changes:
 * - ✅ FIXED: Uses children prop (not Outlet)
 * - ✅ FIXED: All admin pages render correctly
 */

import React, { useState } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguageContext } from "../context/LanguageContext";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Award,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Home,
  Ticket,
  Bell,
  ScrollText,
  UserCheck,
} from "lucide-react";
import { cn } from "../utils/helpers";

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { language } = useLanguageContext();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  console.log("🔐 AdminLayout rendered, user role:", user?.role);

  // ✅ Check admin access
  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  const navItems = [
    {
      path: "/admin",
      icon: LayoutDashboard,
      label: { fa: "داشبورد", en: "Dashboard" },
      exact: true,
    },
    {
      path: "/admin/users",
      icon: Users,
      label: { fa: "کاربران", en: "Users" },
    },
    {
      path: "/admin/lessons",
      icon: BookOpen,
      label: { fa: "درس‌ها", en: "Lessons" },
    },
    {
      path: "/admin/exercises",
      icon: FileText,
      label: { fa: "تمرینات", en: "Exercises" },
    },
    {
      path: "/admin/achievements",
      icon: Award,
      label: { fa: "دستاوردها", en: "Achievements" },
    },
    {
      path: "/admin/mentors",
      icon: UserCheck,
      label: { fa: "منتورها", en: "Mentors" },
    },
    {
      path: "/admin/analytics",
      icon: BarChart3,
      label: { fa: "آمار بازدید", en: "Analytics" },
    },
    {
      path: "/admin/stats",
      icon: BarChart3,
      label: { fa: "آمار سیستم", en: "Statistics" },
    },
    {
      path: "/admin/tickets",
      icon: Ticket,
      label: { fa: "تیکت‌ها", en: "Tickets" },
    },
    {
      path: "/admin/notifications",
      icon: Bell,
      label: { fa: "اعلان‌ها", en: "Notifications" },
    },
    {
      path: "/admin/logs",
      icon: ScrollText,
      label: { fa: "لاگ‌ها", en: "Logs" },
    },
    {
      path: "/admin/settings",
      icon: Settings,
      label: { fa: "تنظیمات", en: "Settings" },
    },
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
          <Link to="/admin" className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary-500" />
            <span className="font-bold text-gray-900 dark:text-white">
              {language === "fa" ? "پنل مدیریت" : "Admin Panel"}
            </span>
          </Link>
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <Link to="/admin" className="flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-primary-500" />
            <span className="font-bold text-gray-900 dark:text-white">
              {language === "fa" ? "پنل مدیریت" : "Admin Panel"}
            </span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition",
                  active
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {item.label[language] || item.label.en}
                </span>
              </Link>
            );
          })}
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <Home className="w-5 h-5" />
              <span className="text-sm font-medium">
                {language === "fa" ? "بازگشت به سایت" : "Back to Site"}
              </span>
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">
                {language === "fa" ? "خروج" : "Logout"}
              </span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 hidden lg:block",
          sidebarOpen ? "w-64" : "w-20",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            {sidebarOpen ? (
              <Link to="/admin" className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-primary-500" />
                <span className="font-bold text-gray-900 dark:text-white">
                  {language === "fa" ? "پنل مدیریت" : "Admin Panel"}
                </span>
              </Link>
            ) : (
              <GraduationCap className="w-6 h-6 text-primary-500 mx-auto" />
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {sidebarOpen ? (
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path, item.exact);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition",
                    active
                      ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="text-sm font-medium whitespace-nowrap">
                      {item.label[language] || item.label.en}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
            <Link
              to="/dashboard"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition",
                !sidebarOpen && "justify-center",
              )}
            >
              <Home className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="text-sm font-medium whitespace-nowrap">
                  {language === "fa" ? "بازگشت به سایت" : "Back to Site"}
                </span>
              )}
            </Link>
            <button
              onClick={logout}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition",
                !sidebarOpen && "justify-center",
              )}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <span className="text-sm font-medium whitespace-nowrap">
                  {language === "fa" ? "خروج" : "Logout"}
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "transition-all duration-300",
          "lg:ml-64",
          !sidebarOpen && "lg:ml-20",
          "pt-16 lg:pt-0",
        )}
      >
        <div className="p-4 lg:p-8">
          {/* ✅ Render children (Routes) */}
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
