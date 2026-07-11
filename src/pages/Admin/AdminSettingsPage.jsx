/**
 * AdminSettingsPage.jsx
 * تنظیمات سیستم — feature flags، عمومی، AI
 */

import { useState, useEffect } from "react";
import adminApi from "../../services/adminApi";
import { Save, ToggleLeft, ToggleRight } from "lucide-react";
import { useLanguageContext } from "../../context/LanguageContext";

function AdminSettingsPage() {
  const { language } = useLanguageContext();
  const [settings, setSettings] = useState(null);
  const [flags, setFlags] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const [settingsRes, flagsRes] = await Promise.all([
        adminApi.getSettings(),
        adminApi.getFeatureFlags(),
      ]);
      setSettings(settingsRes.data);
      setFlags(flagsRes.data);
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await adminApi.updateSettings(settings);
      alert(language === "fa" ? "تنظیمات ذخیره شد" : "Settings saved");
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFlag = async (key, currentValue) => {
    const newFlags = { ...flags, [key]: !currentValue };
    setFlags(newFlags);
    try {
      await adminApi.updateFeatureFlags(newFlags);
    } catch (err) {
      console.error("Failed to update flag:", err);
      setFlags(flags);
    }
  };

  if (loading)
    return <div className="text-center py-12 text-neutral-500">Loading...</div>;
  if (!settings) return null;

  const featureFlagKeys = [
    {
      key: "enable_registration",
      label: { fa: "ثبت‌نام", en: "Registration" },
    },
    { key: "enable_ai_tutor", label: { fa: "معلم AI", en: "AI Tutor" } },
    { key: "enable_mentors", label: { fa: "منتورها", en: "Mentors" } },
    { key: "enable_stories", label: { fa: "داستان‌ها", en: "Stories" } },
    { key: "enable_scenarios", label: { fa: "سناریوها", en: "Scenarios" } },
    {
      key: "enable_leaderboard",
      label: { fa: "جدول رتبه‌بندی", en: "Leaderboard" },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
          {language === "fa" ? "تنظیمات سیستم" : "System Settings"}
        </h2>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-4 py-2 text-sm rounded-lg bg-primary-500 text-white flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />{" "}
          {saving ? "..." : language === "fa" ? "ذخیره" : "Save"}
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">
          {language === "fa" ? "قابلیت‌ها (Feature Flags)" : "Feature Flags"}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {featureFlagKeys.map((flag) => {
            const value = flags?.[flag.key];
            return (
              <button
                key={flag.key}
                onClick={() => handleToggleFlag(flag.key, value)}
                className={`flex items-center gap-2 p-3 rounded-lg border ${value ? "border-success-300 bg-success-50 dark:bg-success-900/20" : "border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50"}`}
              >
                {value ? (
                  <ToggleRight className="w-6 h-6 text-success-500" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-neutral-400" />
                )}
                <span
                  className={`text-sm ${value ? "text-neutral-900 dark:text-white" : "text-neutral-400"}`}
                >
                  {flag.label[language]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">
          {language === "fa" ? "تنظیمات عمومی" : "General Settings"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-neutral-500 block mb-1">
              Site Name (FA)
            </label>
            <input
              type="text"
              value={settings.site_name?.value?.fa || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  site_name: {
                    ...settings.site_name,
                    value: { ...settings.site_name?.value, fa: e.target.value },
                  },
                })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500 block mb-1">
              Site Name (EN)
            </label>
            <input
              type="text"
              value={settings.site_name?.value?.en || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  site_name: {
                    ...settings.site_name,
                    value: { ...settings.site_name?.value, en: e.target.value },
                  },
                })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500 block mb-1">
              Contact Email
            </label>
            <input
              type="email"
              value={settings.contact_email?.value || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  contact_email: {
                    ...settings.contact_email,
                    value: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500 block mb-1">
              Max Lessons Per Day
            </label>
            <input
              type="number"
              value={settings.max_lessons_per_day?.value || 20}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  max_lessons_per_day: {
                    ...settings.max_lessons_per_day,
                    value: parseInt(e.target.value),
                  },
                })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">
          {language === "fa" ? "تنظیمات هوش مصنوعی" : "AI Settings"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-neutral-500 block mb-1">Model</label>
            <input
              type="text"
              value={settings.ai_model?.value || "gpt-3.5-turbo"}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  ai_model: { ...settings.ai_model, value: e.target.value },
                })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500 block mb-1">
              Max Tokens
            </label>
            <input
              type="number"
              value={settings.ai_max_tokens?.value || 2048}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  ai_max_tokens: {
                    ...settings.ai_max_tokens,
                    value: parseInt(e.target.value),
                  },
                })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs text-neutral-500 block mb-1">
              Temperature
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="2"
              value={settings.ai_temperature?.value || 0.7}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  ai_temperature: {
                    ...settings.ai_temperature,
                    value: parseFloat(e.target.value),
                  },
                })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-4">
          {language === "fa" ? "حالت نگهداری" : "Maintenance Mode"}
        </h3>
        <button
          onClick={() => {
            const newValue = !settings.maintenance_mode?.value;
            setSettings({
              ...settings,
              maintenance_mode: {
                ...settings.maintenance_mode,
                value: newValue,
              },
            });
          }}
          className={`flex items-center gap-2 p-3 rounded-lg border ${settings.maintenance_mode?.value ? "border-danger-300 bg-danger-50 dark:bg-danger-900/20" : "border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50"}`}
        >
          {settings.maintenance_mode?.value ? (
            <ToggleRight className="w-6 h-6 text-danger-500" />
          ) : (
            <ToggleLeft className="w-6 h-6 text-neutral-400" />
          )}
          <span
            className={`text-sm ${settings.maintenance_mode?.value ? "text-danger-600 dark:text-danger-400" : "text-neutral-400"}`}
          >
            {settings.maintenance_mode?.value
              ? language === "fa"
                ? "سایت در حالت نگهداری است"
                : "Maintenance mode is ON"
              : language === "fa"
                ? "سایت فعال است"
                : "Site is active"}
          </span>
        </button>
      </div>
    </div>
  );
}

export default AdminSettingsPage;
