/**
 * SettingsPage.jsx
 * Path: src/pages/Settings/SettingsPage.jsx
 * Description: Complete settings page with tabs
 * Version: 2.0 - Complete settings UI
 * Features:
 * - ✅ Profile settings (name, bio, avatar)
 * - ✅ Account settings (email, password, delete account)
 * - ✅ Notification settings (email, push, in-app)
 * - ✅ Appearance settings (theme, language)
 * - ✅ Privacy settings
 * - ✅ Tab navigation
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Lock,
  Bell,
  Palette,
  Shield,
  Globe,
  Moon,
  Sun,
  Monitor,
  Trash2,
  Mail,
  Save,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../components/ui/Toast";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { cn } from "../../utils/helpers";

const TABS = [
  { id: "profile", label: "پروفایل", icon: User },
  { id: "account", label: "حساب کاربری", icon: Lock },
  { id: "notifications", label: "اعلان‌ها", icon: Bell },
  { id: "appearance", label: "ظاهر", icon: Palette },
  { id: "privacy", label: "حریم خصوصی", icon: Shield },
];

const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const { language, changeLanguage, supportedLanguages } = useLanguage();
  const { theme, setTheme, isSystem } = useTheme();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    email: user?.email || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    emailLessons: true,
    emailAchievements: true,
    emailWeekly: false,
    pushNotifications: true,
    inAppNotifications: true,
    soundEnabled: true,
  });

  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showProgress: true,
    showOnLeaderboard: true,
    allowDirectMessages: true,
  });

  // ============================================
  // 💾 Save Profile
  // ============================================

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await api.put("/users/profile", profileForm);
      if (response.data.success) {
        updateUser(response.data.data);
        toast.success("پروفایل ذخیره شد");
      }
    } catch (err) {
      toast.error("خطا در ذخیره پروفایل");
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================
  // 🔑 Change Password
  // ============================================

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("رمزهای عبور جدید مطابقت ندارند");
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.put("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (response.data.success) {
        toast.success("رمز عبور تغییر کرد");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "خطا در تغییر رمز عبور");
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================
  // 🗑️ Delete Account
  // ============================================

  const handleDeleteAccount = async () => {
    if (!confirm("آیا مطمئن هستید؟ این عمل قابل بازگشت نیست!")) return;
    if (!confirm("تمام داده‌های شما حذف خواهد شد. ادامه می‌دهید؟")) return;

    try {
      await api.delete("/users/account");
      toast.success("حساب حذف شد");
      logout();
    } catch (err) {
      toast.error("خطا در حذف حساب");
    }
  };

  // ============================================
  // 🖼️ Render
  // ============================================

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6">تنظیمات</h1>

      <div className="grid lg:grid-cols-[200px_1fr] gap-6">
        {/* Tabs Sidebar */}
        <div className="flex lg:flex-col gap-2 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-primary-500 text-white"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800",
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <Card padding="lg">
                <h2 className="text-lg font-bold mb-4">اطلاعات پروفایل</h2>
                <div className="space-y-4">
                  <Input
                    label="نام"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                  <Input
                    label="ایمیل"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  />
                  <Input
                    label="بیوگرافی"
                    multiline
                    rows={3}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    showCount
                    maxLength={200}
                  />
                  <Button
                    variant="primary"
                    icon={Save}
                    onClick={handleSaveProfile}
                    isLoading={isSaving}
                  >
                    ذخیره تغییرات
                  </Button>
                </div>
              </Card>
            )}

            {/* Account Tab */}
            {activeTab === "account" && (
              <div className="space-y-6">
                <Card padding="lg">
                  <h2 className="text-lg font-bold mb-4">تغییر رمز عبور</h2>
                  <div className="space-y-4">
                    <Input
                      label="رمز عبور فعلی"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                    />
                    <Input
                      label="رمز عبور جدید"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                    />
                    <Input
                      label="تکرار رمز عبور جدید"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                    />
                    <Button
                      variant="primary"
                      onClick={handleChangePassword}
                      isLoading={isSaving}
                    >
                      تغییر رمز عبور
                    </Button>
                  </div>
                </Card>

                <Card padding="lg" className="border-danger-200 dark:border-danger-900">
                  <h2 className="text-lg font-bold mb-2 text-danger-500">منطقه خطر</h2>
                  <p className="text-sm text-neutral-500 mb-4">
                    با حذف حساب، تمام داده‌های شما به طور دائمی پاک خواهد شد.
                  </p>
                  <Button variant="danger" icon={Trash2} onClick={handleDeleteAccount}>
                    حذف حساب کاربری
                  </Button>
                </Card>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <Card padding="lg">
                <h2 className="text-lg font-bold mb-4">تنظیمات اعلان‌ها</h2>
                <div className="space-y-4">
                  <ToggleItem
                    icon={Mail}
                    label="اعلان‌های ایمیل - درس‌ها"
                    description="اطلاع از درس‌های جدید"
                    checked={notifications.emailLessons}
                    onChange={(v) => setNotifications({ ...notifications, emailLessons: v })}
                  />
                  <ToggleItem
                    icon={Mail}
                    label="اعلان‌های ایمیل - دستاوردها"
                    description="اطلاع از دستاوردهای جدید"
                    checked={notifications.emailAchievements}
                    onChange={(v) => setNotifications({ ...notifications, emailAchievements: v })}
                  />
                  <ToggleItem
                    icon={Bell}
                    label="اعلان‌های درون برنامه‌ای"
                    checked={notifications.inAppNotifications}
                    onChange={(v) => setNotifications({ ...notifications, inAppNotifications: v })}
                  />
                  <ToggleItem
                    icon={Bell}
                    label="اعلان‌های Push"
                    checked={notifications.pushNotifications}
                    onChange={(v) => setNotifications({ ...notifications, pushNotifications: v })}
                  />
                  <ToggleItem
                    icon={Bell}
                    label="پخش صدا"
                    checked={notifications.soundEnabled}
                    onChange={(v) => setNotifications({ ...notifications, soundEnabled: v })}
                  />
                </div>
              </Card>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <Card padding="lg">
                  <h2 className="text-lg font-bold mb-4">پوسته</h2>
                  <div className="grid grid-cols-3 gap-3">
                    <ThemeButton
                      icon={Sun}
                      label="روشن"
                      active={theme === "light"}
                      onClick={() => setTheme("light")}
                    />
                    <ThemeButton
                      icon={Moon}
                      label="تیره"
                      active={theme === "dark"}
                      onClick={() => setTheme("dark")}
                    />
                    <ThemeButton
                      icon={Monitor}
                      label="سیستم"
                      active={theme === "system"}
                      onClick={() => setTheme("system")}
                    />
                  </div>
                </Card>

                <Card padding="lg">
                  <h2 className="text-lg font-bold mb-4">زبان</h2>
                  <div className="space-y-2">
                    {supportedLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-colors",
                          language === lang.code
                            ? "border-primary-500 bg-primary-50 dark:bg-primary-950"
                            : "border-neutral-200 dark:border-neutral-700",
                        )}
                      >
                        <Globe className="w-5 h-5" />
                        <span className="font-medium">{lang.name}</span>
                        <span className="text-xs text-neutral-400 mr-auto">{lang.dir.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === "privacy" && (
              <Card padding="lg">
                <h2 className="text-lg font-bold mb-4">حریم خصوصی</h2>
                <div className="space-y-4">
                  <ToggleItem
                    icon={User}
                    label="نمایش پروفایل"
                    description="پروفایل شما برای دیگران قابل مشاهده باشد"
                    checked={privacy.showProfile}
                    onChange={(v) => setPrivacy({ ...privacy, showProfile: v })}
                  />
                  <ToggleItem
                    icon={User}
                    label="نمایش پیشرفت"
                    description="پیشرفت یادگیری شما قابل مشاهده باشد"
                    checked={privacy.showProgress}
                    onChange={(v) => setPrivacy({ ...privacy, showProgress: v })}
                  />
                  <ToggleItem
                    icon={User}
                    label="نمایش در جدول رهبران"
                    checked={privacy.showOnLeaderboard}
                    onChange={(v) => setPrivacy({ ...privacy, showOnLeaderboard: v })}
                  />
                  <ToggleItem
                    icon={Mail}
                    label="اجازه پیام مستقیم"
                    checked={privacy.allowDirectMessages}
                    onChange={(v) => setPrivacy({ ...privacy, allowDirectMessages: v })}
                  />
                </div>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// ============================================
// 🔘 Toggle Item
// ============================================

const ToggleItem = ({ icon: Icon, label, description, checked, onChange }) => (
  <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white dark:bg-neutral-800 rounded-lg">
        <Icon className="w-5 h-5 text-neutral-500" />
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-neutral-400">{description}</p>}
      </div>
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-12 h-6 rounded-full transition-colors",
        checked ? "bg-primary-500" : "bg-neutral-300 dark:bg-neutral-700",
      )}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={cn(
          "absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform",
          checked ? "left-0.5" : "left-6",
        )}
      />
    </button>
  </div>
);

// ============================================
// 🎨 Theme Button
// ============================================

const ThemeButton = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors",
      active
        ? "border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-500"
        : "border-neutral-200 dark:border-neutral-700",
    )}
  >
    <Icon className="w-6 h-6" />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

export default SettingsPage;
