/**
 * AdminSettingsPage.jsx
 * Path: src/pages/Admin/AdminSettingsPage.jsx
 * Description: Admin settings page with feature flags
 * Version: 2.0 - Feature flags, system settings
 * Features:
 * - ✅ Feature flags (enable/disable features)
 * - ✅ System settings (maintenance mode, registrations)
 * - ✅ Email settings
 * - ✅ AI provider settings
 * - ✅ Rate limiting config
 * - ✅ Cache management
 */

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Flag,
  Mail,
  Bot,
  Database,
  Save,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import api from "../../services/api";
import Card, { CardHeader, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Skeleton from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/Toast";
import { cn } from "@utils/helpers";

const AdminSettingsPage = () => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    features: {
      aiTutor: true,
      stories: true,
      scenarios: true,
      achievements: true,
      leaderboard: true,
      mentors: false,
      spacedRepetition: true,
    },
    system: {
      maintenanceMode: false,
      allowRegistrations: true,
      requireEmailVerification: true,
      maxUsers: 10000,
    },
    email: {
      provider: "smtp",
      from: "noreply@learning-academy.com",
      host: "",
      port: 587,
      secure: false,
    },
    ai: {
      provider: "openai",
      apiKey: "",
      model: "gpt-4",
      maxTokens: 1000,
      temperature: 0.7,
    },
    rateLimit: {
      general: 100,
      auth: 5,
      ai: 20,
    },
  });

  // ============================================
  // 📡 Fetch Settings
  // ============================================

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/admin/settings");
      if (response.data.success) {
        setSettings({ ...settings, ...response.data.data });
      }
    } catch (err) {
      toast.error("خطا در بارگذاری تنظیمات");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // ============================================
  // 💾 Save Settings
  // ============================================

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put("/admin/settings", settings);
      toast.success("تنظیمات ذخیره شد");
    } catch (err) {
      toast.error("خطا در ذخیره تنظیمات");
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================
  // 🔄 Clear Cache
  // ============================================

  const handleClearCache = async () => {
    if (!confirm("آیا از پاک کردن کش مطمئن هستید؟")) return;
    try {
      await api.post("/admin/cache/clear");
      toast.success("کش پاک شد");
    } catch (err) {
      toast.error("خطا در پاک کردن کش");
    }
  };

  // ============================================
  // 🖼️ Loading
  // ============================================

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="title" />
        <Skeleton variant="card" count={4} />
      </div>
    );
  }

  // ============================================
  // 🖼️ Render
  // ============================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">تنظیمات سیستم</h1>
          <p className="text-sm text-neutral-500 mt-1">
            پیکربندی ویژگی‌ها و سرویس‌ها
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={handleClearCache}
          >
            پاک کردن کش
          </Button>
          <Button
            variant="primary"
            icon={Save}
            onClick={handleSave}
            isLoading={isSaving}
          >
            ذخیره تنظیمات
          </Button>
        </div>
      </div>

      {/* Maintenance Mode Warning */}
      {settings.system.maintenanceMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-warning-50 dark:bg-warning-950 border border-warning-200 dark:border-warning-900 rounded-xl"
        >
          <AlertTriangle className="w-5 h-5 text-warning-500" />
          <div>
            <p className="font-medium text-warning-700 dark:text-warning-400">
              سیستم در حالت نگهداری است
            </p>
            <p className="text-sm text-warning-600 dark:text-warning-500">
              کاربران غیر ادمین نمی‌توانند وارد سیستم شوند.
            </p>
          </div>
        </motion.div>
      )}

      {/* Feature Flags */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-bold">ویژگی‌ها (Feature Flags)</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          <ToggleRow
            label="معلم هوش مصنوعی"
            description="چت با هوش مصنوعی برای پاسخ به سؤالات"
            checked={settings.features.aiTutor}
            onChange={(v) =>
              setSettings({
                ...settings,
                features: { ...settings.features, aiTutor: v },
              })
            }
          />
          <ToggleRow
            label="داستان‌ها"
            description="بخش داستان‌های تعاملی"
            checked={settings.features.stories}
            onChange={(v) =>
              setSettings({
                ...settings,
                features: { ...settings.features, stories: v },
              })
            }
          />
          <ToggleRow
            label="سناریوها"
            description="شبیه‌سازی موقعیت‌های واقعی"
            checked={settings.features.scenarios}
            onChange={(v) =>
              setSettings({
                ...settings,
                features: { ...settings.features, scenarios: v },
              })
            }
          />
          <ToggleRow
            label="دستاوردها"
            description="سیستم دستاوردها و نشان‌ها"
            checked={settings.features.achievements}
            onChange={(v) =>
              setSettings({
                ...settings,
                features: { ...settings.features, achievements: v },
              })
            }
          />
          <ToggleRow
            label="جدول رهبران"
            description="رتبه‌بندی کاربران"
            checked={settings.features.leaderboard}
            onChange={(v) =>
              setSettings({
                ...settings,
                features: { ...settings.features, leaderboard: v },
              })
            }
          />
          <ToggleRow
            label="منتورها"
            description="سیستم منتورینگ انسانی"
            checked={settings.features.mentors}
            onChange={(v) =>
              setSettings({
                ...settings,
                features: { ...settings.features, mentors: v },
              })
            }
          />
          <ToggleRow
            label="تکرار فاصله‌دار"
            description="الگوریتم Spaced Repetition"
            checked={settings.features.spacedRepetition}
            onChange={(v) =>
              setSettings({
                ...settings,
                features: { ...settings.features, spacedRepetition: v },
              })
            }
          />
        </CardBody>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-accent-500" />
            <h2 className="text-lg font-bold">تنظیمات سیستم</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          <ToggleRow
            label="حالت نگهداری"
            description="غیرفعال کردن دسترسی کاربران عادی"
            checked={settings.system.maintenanceMode}
            onChange={(v) =>
              setSettings({
                ...settings,
                system: { ...settings.system, maintenanceMode: v },
              })
            }
            danger
          />
          <ToggleRow
            label="اجازه ثبت‌نام"
            description="کاربران جدید می‌توانند ثبت‌نام کنند"
            checked={settings.system.allowRegistrations}
            onChange={(v) =>
              setSettings({
                ...settings,
                system: { ...settings.system, allowRegistrations: v },
              })
            }
          />
          <ToggleRow
            label="تأیید ایمیل الزامی"
            description="کاربران باید ایمیل خود را تأیید کنند"
            checked={settings.system.requireEmailVerification}
            onChange={(v) =>
              setSettings({
                ...settings,
                system: { ...settings.system, requireEmailVerification: v },
              })
            }
          />
          <Input
            label="حداکثر تعداد کاربران"
            type="number"
            value={settings.system.maxUsers}
            onChange={(e) =>
              setSettings({
                ...settings,
                system: {
                  ...settings.system,
                  maxUsers: parseInt(e.target.value) || 0,
                },
              })
            }
          />
        </CardBody>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-success-500" />
            <h2 className="text-lg font-bold">تنظیمات ایمیل</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          <Input
            label="آدرس فرستنده"
            type="email"
            value={settings.email.from}
            onChange={(e) =>
              setSettings({
                ...settings,
                email: { ...settings.email, from: e.target.value },
              })
            }
          />
          <Input
            label="میزبان SMTP"
            value={settings.email.host}
            onChange={(e) =>
              setSettings({
                ...settings,
                email: { ...settings.email, host: e.target.value },
              })
            }
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="پورت"
              type="number"
              value={settings.email.port}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  email: {
                    ...settings.email,
                    port: parseInt(e.target.value) || 587,
                  },
                })
              }
            />
            <div className="flex items-end">
              <ToggleRow
                label="SSL/TLS"
                checked={settings.email.secure}
                onChange={(v) =>
                  setSettings({
                    ...settings,
                    email: { ...settings.email, secure: v },
                  })
                }
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* AI Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-warning-500" />
            <h2 className="text-lg font-bold">تنظیمات هوش مصنوعی</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              ارائه‌دهنده
            </label>
            <select
              value={settings.ai.provider}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  ai: { ...settings.ai, provider: e.target.value },
                })
              }
              className="w-full px-4 py-2.5 rounded-xl border-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="local">Local LLM</option>
            </select>
          </div>
          <Input
            label="API Key"
            type="password"
            value={settings.ai.apiKey}
            onChange={(e) =>
              setSettings({
                ...settings,
                ai: { ...settings.ai, apiKey: e.target.value },
              })
            }
          />
          <Input
            label="مدل"
            value={settings.ai.model}
            onChange={(e) =>
              setSettings({
                ...settings,
                ai: { ...settings.ai, model: e.target.value },
              })
            }
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="حداکثر توکن"
              type="number"
              value={settings.ai.maxTokens}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  ai: {
                    ...settings.ai,
                    maxTokens: parseInt(e.target.value) || 1000,
                  },
                })
              }
            />
            <Input
              label="دمــا (Temperature)"
              type="number"
              step="0.1"
              min="0"
              max="2"
              value={settings.ai.temperature}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  ai: {
                    ...settings.ai,
                    temperature: parseFloat(e.target.value) || 0.7,
                  },
                })
              }
            />
          </div>
        </CardBody>
      </Card>

      {/* Rate Limiting */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-danger-500" />
            <h2 className="text-lg font-bold">محدودیت نرخ</h2>
          </div>
        </CardHeader>
        <CardBody className="space-y-3">
          <Input
            label="درخواست‌های عمومی (در ۱۵ دقیقه)"
            type="number"
            value={settings.rateLimit.general}
            onChange={(e) =>
              setSettings({
                ...settings,
                rateLimit: {
                  ...settings.rateLimit,
                  general: parseInt(e.target.value) || 100,
                },
              })
            }
          />
          <Input
            label="درخواست‌های احراز هویت (در ۱۵ دقیقه)"
            type="number"
            value={settings.rateLimit.auth}
            onChange={(e) =>
              setSettings({
                ...settings,
                rateLimit: {
                  ...settings.rateLimit,
                  auth: parseInt(e.target.value) || 5,
                },
              })
            }
          />
          <Input
            label="درخواست‌های AI (در دقیقه)"
            type="number"
            value={settings.rateLimit.ai}
            onChange={(e) =>
              setSettings({
                ...settings,
                rateLimit: {
                  ...settings.rateLimit,
                  ai: parseInt(e.target.value) || 20,
                },
              })
            }
          />
        </CardBody>
      </Card>
    </div>
  );
};

// ============================================
// 🔘 Toggle Row
// ============================================

const ToggleRow = ({ label, description, checked, onChange, danger }) => (
  <div
    className={cn(
      "flex items-center justify-between p-3 rounded-xl",
      danger && checked
        ? "bg-danger-50 dark:bg-danger-950"
        : "bg-neutral-50 dark:bg-neutral-800/50",
    )}
  >
    <div>
      <p className="text-sm font-medium">{label}</p>
      {description && <p className="text-xs text-neutral-400">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-12 h-6 rounded-full transition-colors",
        checked
          ? danger
            ? "bg-danger-500"
            : "bg-primary-500"
          : "bg-neutral-300 dark:bg-neutral-700",
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

export default AdminSettingsPage;
