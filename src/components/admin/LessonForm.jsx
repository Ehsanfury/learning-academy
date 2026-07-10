/**
 * LessonForm.jsx
 * Path: src/components/admin/LessonForm.jsx
 * Description: Lesson form for create/edit
 */

import React, { useState } from "react";
import { useLanguageContext } from "../../context/LanguageContext";
import api from "../../services/api";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const LessonForm = ({ lesson = null, onClose, onSuccess }) => {
  const { language } = useLanguageContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: lesson?.id || "",
    level: lesson?.level || "A1",
    order: lesson?.order || 1,
    title: lesson?.title || { fa: "", en: "", de: "" },
    description: lesson?.description || { fa: "", en: "", de: "" },
    xpReward: lesson?.xpReward || 50,
    status: lesson?.status || "draft",
    estimatedTime: lesson?.estimatedTime || 20,
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
      if (lesson) {
        await api.put(`/admin/lessons/${lesson.id}`, formData);
        toast.success("درس با موفقیت بروزرسانی شد");
      } else {
        await api.post("/admin/lessons", formData);
        toast.success("درس با موفقیت ایجاد شد");
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "خطا در ذخیره درس");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {lesson
              ? language === "fa"
                ? "ویرایش درس"
                : "Edit Lesson"
              : language === "fa"
                ? "درس جدید"
                : "New Lesson"}
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
              {language === "fa" ? "شناسه" : "ID"}
            </label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => handleChange("id", e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              disabled={!!lesson}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Level</label>
              <select
                value={formData.level}
                onChange={(e) => handleChange("level", e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                {["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {language === "fa" ? "ترتیب" : "Order"}
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) =>
                  handleChange("order", parseInt(e.target.value))
                }
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
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
              <label className="block text-sm font-medium mb-1">XP</label>
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
                {language === "fa" ? "زمان (دقیقه)" : "Time (minutes)"}
              </label>
              <input
                type="number"
                value={formData.estimatedTime}
                onChange={(e) =>
                  handleChange("estimatedTime", parseInt(e.target.value))
                }
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {language === "fa" ? "وضعیت" : "Status"}
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              <option value="draft">
                {language === "fa" ? "پیش‌نویس" : "Draft"}
              </option>
              <option value="published">
                {language === "fa" ? "منتشر شده" : "Published"}
              </option>
              <option value="archived">
                {language === "fa" ? "بایگانی" : "Archived"}
              </option>
            </select>
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
              {lesson
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

export default LessonForm;
