/**
 * ExerciseForm.jsx
 * Path: src/components/admin/ExerciseForm.jsx
 * Description: Exercise form for create/edit
 */

import React, { useState } from "react";
import { useLanguageContext } from "../../context/LanguageContext";
import api from "../../services/api";
import { X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const ExerciseForm = ({ exercise = null, onClose, onSuccess }) => {
  const { language } = useLanguageContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: exercise?.title || { fa: "", en: "", de: "" },
    type: exercise?.type || "mixed",
    level: exercise?.level || "A1",
    questions: exercise?.questions || [],
    xpReward: exercise?.xpReward || 10,
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
      if (exercise) {
        await api.put(`/admin/exercises/${exercise.id}`, formData);
        toast.success("تمرین با موفقیت بروزرسانی شد");
      } else {
        await api.post("/admin/exercises", formData);
        toast.success("تمرین با موفقیت ایجاد شد");
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "خطا در ذخیره تمرین");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {exercise
              ? language === "fa"
                ? "ویرایش تمرین"
                : "Edit Exercise"
              : language === "fa"
                ? "تمرین جدید"
                : "New Exercise"}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {language === "fa" ? "نوع" : "Type"}
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange("type", e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value="mixed">Mixed</option>
                <option value="vocabulary">Vocabulary</option>
                <option value="grammar">Grammar</option>
                <option value="reading">Reading</option>
                <option value="listening">Listening</option>
                <option value="writing">Writing</option>
              </select>
            </div>
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
          </div>

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
              {language === "fa" ? "سوالات (JSON)" : "Questions (JSON)"}
            </label>
            <textarea
              rows={5}
              value={JSON.stringify(formData.questions, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleChange("questions", parsed);
                } catch {
                  // Invalid JSON - ignore
                }
              }}
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              {language === "fa"
                ? "سوالات را به صورت JSON وارد کنید"
                : "Enter questions as JSON"}
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
              {exercise
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

export default ExerciseForm;
