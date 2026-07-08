/**
 * SettingsPage.jsx
 * Path: src/pages/Settings/SettingsPage.jsx
 * Description: User settings with preferences and account management
 * Version: 3.2 - Fixed all imports
 */

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@context/AuthContext";
import { useLanguageContext } from "@context/LanguageContext";
import { useThemeContext } from "@context/ThemeContext";
import api from "@services/api";
import debug from "../../utils/debug";
import {
  Loader2,
  Settings,
  Save,
  Monitor,
  Sun,
  Moon,
  Languages,
  Bell,
  Volume2,
  Zap,
  Shield,
  User,
  LogOut,
  Trash2,
  Eye,
  EyeOff,
  Key,
} from "lucide-react";
import toast from "react-hot-toast";

// ✅ استفاده از کامپوننت‌های UI
import Card from "@components/ui/Card";
import Button from "@components/ui/Button";
import Badge from "@components/ui/Badge";
import Skeleton from "@components/ui/Skeleton";
import Input from "@components/ui/Input";

// ============================================
// 📊 Settings Page
// ============================================

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguageContext();
  const { isDark, toggleTheme } = useThemeContext();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Settings state
  const [settings, setSettings] = useState({
    language: language || "fa",
    theme: isDark ? "dark" : "light",
    notifications: true,
    soundEnabled: true,
    streakReminder: true,
    autoPlayAudio: false,
    dailyGoal: 50,
    nativeLanguage: "fa",
    learningGoal: "general",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // ============================================
  // 📥 Load Settings
  // ============================================

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/users/settings");
      const data = response?.data || response || {};

      setSettings((prev) => ({
        ...prev,
        ...data,
        language: data.language || language || "fa",
        theme: data.theme || (isDark ? "dark" : "light"),
      }));
    } catch (error) {
      debug.error("Error loading settings:", error);
      setError(error.message || "خطا در بارگذاری تنظیمات");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 💾 Save Settings
  // ============================================

  const saveSettings = async () => {
    try {
      setSaving(true);

      const response = await api.put("/users/settings", settings);

      // Update context if language or theme changed
      if (settings.language !== language) {
        toggleLanguage();
      }
      if ((settings.theme === "dark") !== isDark) {
        toggleTheme();
      }

      toast.success("تنظیمات با موفقیت ذخیره شد");
    } catch (error) {
      debug.error("Error saving settings:", error);
      toast.error("خطا در ذخیره تنظیمات");
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // 🔑 Change Password
  // ============================================

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("رمز عبور جدید و تأیید آن مطابقت ندارند");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("رمز عبور جدید باید حداقل ۶ کاراکتر باشد");
      return;
    }

    try {
      setIsChangingPassword(true);

      await api.post("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("رمز عبور با موفقیت تغییر کرد");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      debug.error("Error changing password:", error);
      toast.error(error.response?.data?.message || "خطا در تغییر رمز عبور");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ============================================
  // 🗑️ Delete Account
  // ============================================

  const deleteAccount = async () => {
    if (
      !window.confirm(
        language === "fa"
          ? "آیا از حذف حساب کاربری خود مطمئن هستید؟ این عمل غیرقابل بازگشت است."
          : "Are you sure you want to delete your account? This action cannot be undone.",
      )
    )
      return;

    try {
      await api.delete("/users/account");
      toast.success("حساب کاربری با موفقیت حذف شد");
      logout();
    } catch (error) {
      debug.error("Error deleting account:", error);
      toast.error("خطا در حذف حساب کاربری");
    }
  };

  // ============================================
  // 🖼️ Render Functions
  // ============================================

  const renderSettingsSection = (title, Icon, children) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-neutral-200 dark:border-neutral-800"
    >
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary-500" />
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </motion.div>
  );

  const renderToggle = (label, value, onChange, description = null) => (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {label}
        </p>
        {description && (
          <p className="text-xs text-neutral-500">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          value ? "bg-primary-500" : "bg-neutral-300 dark:bg-neutral-700"
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
            value ? "translate-x-6" : "translate-x-0.5"
          }`}
        />
      </button>
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary-500" />
          {language === "fa" ? "⚙️ تنظیمات" : "⚙️ Settings"}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          {language === "fa"
            ? "مدیریت تنظیمات و ترجیحات کاربری"
            : "Manage your settings and preferences"}
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {language === "fa" ? "ذخیره تنظیمات" : "Save Settings"}
        </button>
      </div>

      <div className="space-y-6">
        {/* ===== Appearance ===== */}
        {renderSettingsSection(
          language === "fa" ? "ظاهر" : "Appearance",
          Monitor,
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {language === "fa" ? "حالت تاریک" : "Dark Mode"}
                </p>
                <p className="text-xs text-neutral-500">
                  {language === "fa"
                    ? "تغییر تم روشن/تاریک"
                    : "Switch between light and dark theme"}
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 transition"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <Moon className="w-4 h-4 text-blue-500" />
                )}
                <span className="text-sm">
                  {isDark
                    ? language === "fa"
                      ? "روشن"
                      : "Light"
                    : language === "fa"
                      ? "تاریک"
                      : "Dark"}
                </span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  {language === "fa" ? "زبان برنامه" : "App Language"}
                </p>
                <p className="text-xs text-neutral-500">
                  {language === "fa"
                    ? "زبان رابط کاربری"
                    : "User interface language"}
                </p>
              </div>
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 transition"
              >
                <Languages className="w-4 h-4" />
                <span className="text-sm">
                  {language === "fa" ? "فارسی" : "English"}
                </span>
              </button>
            </div>
          </>,
        )}

        {/* ===== Notifications ===== */}
        {renderSettingsSection(
          language === "fa" ? "اعلان‌ها" : "Notifications",
          Bell,
          <>
            {renderToggle(
              language === "fa" ? "اعلان‌ها" : "Notifications",
              settings.notifications,
              (value) => setSettings({ ...settings, notifications: value }),
              language === "fa"
                ? "دریافت اعلان‌های آموزشی و یادآوری"
                : "Receive educational notifications and reminders",
            )}

            {renderToggle(
              language === "fa" ? "یادآوری گل‌زنی" : "Streak Reminder",
              settings.streakReminder,
              (value) => setSettings({ ...settings, streakReminder: value }),
              language === "fa"
                ? "یادآوری روزانه برای حفظ گل‌زنی"
                : "Daily reminder to maintain your streak",
            )}
          </>,
        )}

        {/* ===== Audio ===== */}
        {renderSettingsSection(
          language === "fa" ? "صدا" : "Audio",
          Volume2,
          <>
            {renderToggle(
              language === "fa" ? "صدا" : "Sound",
              settings.soundEnabled,
              (value) => setSettings({ ...settings, soundEnabled: value }),
              language === "fa"
                ? "فعال/غیرفعال کردن صداها"
                : "Enable/disable sounds",
            )}

            {renderToggle(
              language === "fa" ? "پخش خودکار صدا" : "Auto-play Audio",
              settings.autoPlayAudio,
              (value) => setSettings({ ...settings, autoPlayAudio: value }),
              language === "fa"
                ? "پخش خودکار فایل‌های صوتی در درس‌ها"
                : "Auto-play audio files in lessons",
            )}
          </>,
        )}

        {/* ===== Learning ===== */}
        {renderSettingsSection(
          language === "fa" ? "یادگیری" : "Learning",
          Zap,
          <>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {language === "fa" ? "هدف روزانه (XP)" : "Daily Goal (XP)"}
              </label>
              <input
                type="number"
                value={settings.dailyGoal}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    dailyGoal: parseInt(e.target.value) || 50,
                  })
                }
                min={10}
                max={500}
                className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition"
              />
              <p className="text-xs text-neutral-500 mt-1">
                {language === "fa"
                  ? `هدف روزانه شما ${settings.dailyGoal} XP است`
                  : `Your daily goal is ${settings.dailyGoal} XP`}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {language === "fa" ? "زبان مادری" : "Native Language"}
              </label>
              <select
                value={settings.nativeLanguage}
                onChange={(e) =>
                  setSettings({ ...settings, nativeLanguage: e.target.value })
                }
                className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition"
              >
                <option value="fa">فارسی</option>
                <option value="en">English</option>
                <option value="de">Deutsch</option>
                <option value="ar">العربية</option>
                <option value="tr">Türkçe</option>
                <option value="ru">Русский</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                {language === "fa" ? "هدف یادگیری" : "Learning Goal"}
              </label>
              <select
                value={settings.learningGoal}
                onChange={(e) =>
                  setSettings({ ...settings, learningGoal: e.target.value })
                }
                className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition"
              >
                <option value="general">
                  {language === "fa" ? "عمومی" : "General"}
                </option>
                <option value="migration">
                  {language === "fa" ? "مهاجرت" : "Migration"}
                </option>
                <option value="exam">
                  {language === "fa" ? "آزمون" : "Exam"}
                </option>
                <option value="ausbildung">
                  {language === "fa" ? "آموزش حرفه‌ای" : "Vocational Training"}
                </option>
                <option value="university">
                  {language === "fa" ? "دانشگاه" : "University"}
                </option>
                <option value="work">
                  {language === "fa" ? "کار" : "Work"}
                </option>
              </select>
            </div>
          </>,
        )}

        {/* ===== Security ===== */}
        {renderSettingsSection(
          language === "fa" ? "امنیت" : "Security",
          Shield,
          <>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  {language === "fa" ? "رمز عبور فعلی" : "Current Password"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 pr-10 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition"
                    placeholder={
                      language === "fa" ? "رمز عبور فعلی" : "Current password"
                    }
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  {language === "fa" ? "رمز عبور جدید" : "New Password"}
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition"
                  placeholder={
                    language === "fa" ? "رمز عبور جدید" : "New password"
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  {language === "fa"
                    ? "تأیید رمز عبور جدید"
                    : "Confirm New Password"}
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition"
                  placeholder={
                    language === "fa"
                      ? "تأیید رمز عبور جدید"
                      : "Confirm new password"
                  }
                />
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={changePassword}
                disabled={
                  isChangingPassword ||
                  !passwordData.currentPassword ||
                  !passwordData.newPassword
                }
                icon={Key}
                fullWidth
                isLoading={isChangingPassword}
              >
                {language === "fa" ? "تغییر رمز عبور" : "Change Password"}
              </Button>
            </div>
          </>,
        )}

        {/* ===== Account Management ===== */}
        {renderSettingsSection(
          language === "fa" ? "مدیریت حساب" : "Account Management",
          User,
          <>
            <Button
              variant="secondary"
              onClick={logout}
              icon={LogOut}
              fullWidth
            >
              {language === "fa" ? "خروج از حساب" : "Logout"}
            </Button>

            <Button
              variant="danger"
              onClick={deleteAccount}
              icon={Trash2}
              fullWidth
            >
              {language === "fa" ? "حذف حساب کاربری" : "Delete Account"}
            </Button>

            <p className="text-xs text-neutral-400 text-center">
              {language === "fa"
                ? "حذف حساب کاربری غیرقابل بازگشت است و تمام داده‌های شما پاک می‌شود"
                : "Deleting your account is irreversible and all your data will be removed"}
            </p>
          </>,
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
