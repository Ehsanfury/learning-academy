/**
 * AchievementForm.jsx
 * Path: src/components/admin/AchievementForm.jsx
 * Description: Achievement form for create/edit
 */

import React, { useState } from "react";
import { useLanguageContext } from "../../context/LanguageContext";
import api from "../../services/api";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const AchievementForm = ({ achievement = null, onClose, onSuccess }) => {
  const { language } = useLanguageContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: achievement?.name || "",
    title: achievement?.title || { fa: "", en: "", de: "" },
    description: achievement?.description || { fa: "", en: "", de: "" },
    icon: achievement?.icon || "Award",
    color: achievement?.color || "#6366f1",
    category: achievement?.category || "learning",
    tier: achievement?.tier || "bronze",
    xpReward: achievement?.xpReward || 50,
    condition: achievement?.condition || {
      type: "lessons_completed",
      target: 1,
    },
    isActive: achievement?.isActive !== undefined ? achievement.isActive : true,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocalizedChange = (field, lang, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: { ...prev[field], [lang]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (achievement) {
        await api.put(`/admin/achievements/${achievement.id}`, formData);
        toast.success("دستاورد با موفقیت بروزرسانی شد");
      } else {
        await api.post("/admin/achievements", formData);
        toast.success("دستاورد با موفقیت ایجاد شد");
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "خطا در ذخیره دستاورد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {achievement
              ? language === "fa"
                ? "ویرایش دستاورد"
                : "Edit Achievement"
              : language === "fa"
                ? "دستاورد جدید"
                : "New Achievement"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {language === "fa" ? "نام سیستمی" : "System Name"}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g., first_lesson"
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              disabled={!!achievement}
            />
            <p className="text-xs text-gray-500 mt-1">
              {language === "fa"
                ? "شناسه یکتا - فقط حروف انگلیسی، زیرخط و اعداد"
                : "Unique ID - only English letters, underscores and numbers"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {language === "fa" ? "عنوان" : "Title"}
            </label>
            <div className="space-y-2">
              <input
                placeholder="فارسی"
                value={formData.title.fa}
                onChange={(e) =>
                  handleLocalizedChange("title", "fa", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
              <input
                placeholder="English"
                value={formData.title.en}
                onChange={(e) =>
                  handleLocalizedChange("title", "en", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
              <input
                placeholder="Deutsch"
                value={formData.title.de}
                onChange={(e) =>
                  handleLocalizedChange("title", "de", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {language === "fa" ? "توضیحات" : "Description"}
            </label>
            <div className="space-y-2">
              <textarea
                placeholder="فارسی"
                rows={2}
                value={formData.description.fa}
                onChange={(e) =>
                  handleLocalizedChange("description", "fa", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
              <textarea
                placeholder="English"
                rows={2}
                value={formData.description.en}
                onChange={(e) =>
                  handleLocalizedChange("description", "en", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
              <textarea
                placeholder="Deutsch"
                rows={2}
                value={formData.description.de}
                onChange={(e) =>
                  handleLocalizedChange("description", "de", e.target.value)
                }
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {language === "fa" ? "آیکون" : "Icon"}
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => handleChange("icon", e.target.value)}
                placeholder="Award, Star, Crown, etc."
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {language === "fa" ? "رنگ" : "Color"}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleChange("color", e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => handleChange("color", e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {language === "fa" ? "دسته‌بندی" : "Category"}
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value="learning">Learning</option>
                <option value="streak">Streak</option>
                <option value="vocabulary">Vocabulary</option>
                <option value="xp">XP</option>
                <option value="social">Social</option>
                <option value="special">Special</option>
                <option value="milestone">Milestone</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {language === "fa" ? "سطح" : "Tier"}
              </label>
              <select
                value={formData.tier}
                onChange={(e) => handleChange("tier", e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value="bronze">Bronze</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="diamond">Diamond</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                XP Reward
              </label>
              <input
                type="number"
                value={formData.xpReward}
                onChange={(e) =>
                  handleChange("xpReward", parseInt(e.target.value))
                }
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {language === "fa" ? "فعال" : "Active"}
              </label>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange("isActive", e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm">
                  {formData.isActive
                    ? language === "fa"
                      ? "فعال"
                      : "Active"
                    : language === "fa"
                      ? "غیرفعال"
                      : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {language === "fa" ? "شرط (JSON)" : "Condition (JSON)"}
            </label>
            <textarea
              rows={3}
              value={JSON.stringify(formData.condition, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleChange("condition", parsed);
                } catch {
                  // Invalid JSON - ignore
                }
              }}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              {language === "fa"
                ? 'مثال: {"type":"lessons_completed","target":1}'
                : 'Example: {"type":"lessons_completed","target":1}'}
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {language === "fa" ? "انصراف" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {achievement
                ? language === "fa"
                  ? "بروزرسانی"
                  : "Update"
                : language === "fa"
                  ? "ایجاد"
                  : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AchievementForm;
