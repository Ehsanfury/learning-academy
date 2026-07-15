/**
 * LessonForm.jsx
 * Path: src/components/admin/LessonForm.jsx
 * Description: Lesson form with JSON editor for full content
 * Changes:
 * - ✅ FIXED: Added JSON editor for sections content
 * - ✅ FIXED: Full lesson content editing support
 * - ✅ FIXED: Added unit, lessonNumber, perfectBonusXP, difficulty fields
 * - ✅ FIXED: Added totalSections calculation
 */

import React, { useState } from "react";
import { useLanguageContext } from "../../context/LanguageContext";
import api from "../../services/api";
import { X, Loader2, Code2, Eye, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const LessonForm = ({ lesson = null, onClose, onSuccess }) => {
  const { language } = useLanguageContext();
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("form"); // form | json
  const [jsonError, setJsonError] = useState(null);

  // ✅ Complete form data with all lesson fields
  const [formData, setFormData] = useState({
    id: lesson?.id || "",
    level: lesson?.level || "A1",
    unit: lesson?.unit || 1,
    order: lesson?.order || 1,
    lessonNumber: lesson?.lessonNumber || 1,
    title: lesson?.title || { fa: "", en: "", de: "" },
    subtitle: lesson?.subtitle || { fa: "", en: "", de: "" },
    description: lesson?.description || { fa: "", en: "", de: "" },
    xpReward: lesson?.xpReward || 50,
    perfectBonusXP: lesson?.perfectBonusXP || 25,
    status: lesson?.status || "draft",
    estimatedTime: lesson?.estimatedTime || 20,
    difficulty: lesson?.difficulty || 1,
    sections: lesson?.sections || [],
    prerequisites: lesson?.prerequisites || [],
    tags: lesson?.tags || [],
    isActive: lesson?.isActive !== undefined ? lesson.isActive : true,
  });

  // ✅ JSON state
  const [jsonInput, setJsonInput] = useState(
    JSON.stringify(
      {
        ...formData,
        totalSections: formData.sections?.length || 0,
        totalVocabulary:
          formData.sections?.reduce(
            (sum, s) => sum + (s.vocabulary?.length || 0),
            0,
          ) || 0,
      },
      null,
      2,
    ),
  );

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocalizedChange = (field, lang, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: { ...prev[field], [lang]: value },
    }));
  };

  const handleJsonChange = (value) => {
    setJsonInput(value);
    setJsonError(null);
    try {
      const parsed = JSON.parse(value);
      // ✅ Validate required fields
      if (!parsed.id) {
        setJsonError("ID is required");
        return;
      }
      if (!parsed.title?.fa && !parsed.title?.en) {
        setJsonError("At least one title is required");
        return;
      }
      setFormData((prev) => ({ ...prev, ...parsed }));
    } catch (e) {
      setJsonError(e.message);
    }
  };

  const getSectionCount = () => {
    return formData.sections?.length || 0;
  };

  const getVocabularyCount = () => {
    return (
      formData.sections?.reduce(
        (sum, s) => sum + (s.vocabulary?.length || 0),
        0,
      ) || 0
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      // ✅ If in JSON mode, validate first
      if (viewMode === "json") {
        try {
          const parsed = JSON.parse(jsonInput);
          if (!parsed.id) {
            toast.error("شناسه درس الزامی است");
            setLoading(false);
            return;
          }
          if (!parsed.title?.fa && !parsed.title?.en) {
            toast.error("حداقل یک عنوان (فارسی یا انگلیسی) الزامی است");
            setLoading(false);
            return;
          }
          formData.sections = parsed.sections || [];
          formData.totalSections = formData.sections.length;
        } catch (e) {
          toast.error("JSON معتبر نیست: " + e.message);
          setLoading(false);
          return;
        }
      }

      // ✅ Prepare payload
      const payload = {
        ...formData,
        totalSections: formData.sections?.length || 0,
        totalVocabulary:
          formData.sections?.reduce(
            (sum, s) => sum + (s.vocabulary?.length || 0),
            0,
          ) || 0,
      };

      // ✅ Remove undefined values
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) delete payload[key];
      });

      if (lesson) {
        await api.put(`/admin/lessons/${lesson.id}`, payload);
        toast.success("درس با موفقیت بروزرسانی شد");
      } else {
        await api.post("/admin/lessons", payload);
        toast.success("درس با موفقیت ایجاد شد");
      }
      onSuccess();
    } catch (error) {
      console.error("Lesson save error:", error);
      toast.error(error.response?.data?.message || "خطا در ذخیره درس");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            {lesson
              ? language === "fa"
                ? "✏️ ویرایش درس"
                : "✏️ Edit Lesson"
              : language === "fa"
                ? "📝 درس جدید"
                : "📝 New Lesson"}
          </h2>
          <div className="flex items-center gap-2">
            {/* ✅ Statistics */}
            {formData.id && (
              <span className="text-xs text-neutral-400 px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                {getSectionCount()} sections • {getVocabularyCount()} vocab
              </span>
            )}
            {/* ✅ View Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                if (viewMode === "form") {
                  // ✅ Convert to JSON
                  const jsonData = {
                    ...formData,
                    totalSections: formData.sections?.length || 0,
                    totalVocabulary:
                      formData.sections?.reduce(
                        (sum, s) => sum + (s.vocabulary?.length || 0),
                        0,
                      ) || 0,
                  };
                  setJsonInput(JSON.stringify(jsonData, null, 2));
                }
                setViewMode(viewMode === "form" ? "json" : "form");
                setJsonError(null);
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              {viewMode === "form" ? (
                <>
                  <Code2 className="w-4 h-4" />
                  JSON
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Form
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ✅ JSON Error */}
        {jsonError && viewMode === "json" && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600 dark:text-red-400">
              JSON Error: {jsonError}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {viewMode === "form" ? (
            <>
              {/* ✅ ID (Disabled for edit) */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  {language === "fa" ? "شناسه درس" : "Lesson ID"}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => handleChange("id", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  disabled={!!lesson}
                  placeholder="مثال: A1-L13"
                  required
                />
                {lesson && (
                  <p className="text-xs text-neutral-400 mt-1">
                    شناسه درس پس از ایجاد قابل تغییر نیست
                  </p>
                )}
              </div>

              {/* ✅ Level, Unit, Order, Lesson Number */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Level
                  </label>
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
                  <label className="block text-sm font-medium mb-1">Unit</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.unit}
                    onChange={(e) =>
                      handleChange("unit", parseInt(e.target.value) || 1)
                    }
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {language === "fa" ? "درس شماره" : "Lesson #"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.lessonNumber}
                    onChange={(e) =>
                      handleChange(
                        "lessonNumber",
                        parseInt(e.target.value) || 1,
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {language === "fa" ? "ترتیب" : "Order"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) =>
                      handleChange("order", parseInt(e.target.value) || 1)
                    }
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* ✅ Title - Multi-language */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  {language === "fa" ? "عنوان" : "Title"}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="space-y-2">
                  <input
                    placeholder="فارسی"
                    value={formData.title.fa}
                    onChange={(e) =>
                      handleLocalizedChange("title", "fa", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    required
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

              {/* ✅ Subtitle - Multi-language */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  {language === "fa" ? "زیرعنوان" : "Subtitle"}
                </label>
                <div className="space-y-2">
                  <input
                    placeholder="فارسی"
                    value={formData.subtitle.fa}
                    onChange={(e) =>
                      handleLocalizedChange("subtitle", "fa", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                  <input
                    placeholder="English"
                    value={formData.subtitle.en}
                    onChange={(e) =>
                      handleLocalizedChange("subtitle", "en", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                  <input
                    placeholder="Deutsch"
                    value={formData.subtitle.de}
                    onChange={(e) =>
                      handleLocalizedChange("subtitle", "de", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* ✅ Description - Multi-language */}
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

              {/* ✅ XP, Perfect Bonus, Time, Difficulty */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    XP Reward
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.xpReward}
                    onChange={(e) =>
                      handleChange("xpReward", parseInt(e.target.value) || 0)
                    }
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Perfect Bonus XP
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.perfectBonusXP}
                    onChange={(e) =>
                      handleChange(
                        "perfectBonusXP",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {language === "fa" ? "زمان (دقیقه)" : "Time (min)"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.estimatedTime}
                    onChange={(e) =>
                      handleChange(
                        "estimatedTime",
                        parseInt(e.target.value) || 20,
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {language === "fa" ? "سختی" : "Difficulty"}
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) =>
                      handleChange("difficulty", parseInt(e.target.value))
                    }
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  >
                    <option value="1">⭐ Easy</option>
                    <option value="2">⭐⭐ Medium</option>
                    <option value="3">⭐⭐⭐ Hard</option>
                    <option value="4">⭐⭐⭐⭐ Expert</option>
                    <option value="5">⭐⭐⭐⭐⭐ Master</option>
                  </select>
                </div>
              </div>

              {/* ✅ Status and Active */}
              <div className="grid grid-cols-2 gap-4">
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
                      {language === "fa" ? "📝 پیش‌نویس" : "📝 Draft"}
                    </option>
                    <option value="published">
                      {language === "fa" ? "✅ منتشر شده" : "✅ Published"}
                    </option>
                    <option value="archived">
                      {language === "fa" ? "📦 بایگانی" : "📦 Archived"}
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {language === "fa" ? "فعال" : "Active"}
                  </label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="true"
                        checked={formData.isActive === true}
                        onChange={() => handleChange("isActive", true)}
                        className="w-4 h-4 text-primary-500"
                      />
                      <span className="text-sm">
                        ✅ {language === "fa" ? "فعال" : "Active"}
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        value="false"
                        checked={formData.isActive === false}
                        onChange={() => handleChange("isActive", false)}
                        className="w-4 h-4 text-red-500"
                      />
                      <span className="text-sm">
                        ❌ {language === "fa" ? "غیرفعال" : "Inactive"}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* ✅ Section Count Info */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <span className="font-bold">{getSectionCount()}</span> بخش
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      <span className="font-bold">{getVocabularyCount()}</span>{" "}
                      واژگان
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      💡 برای ویرایش محتوای کامل درس، روی دکمه{" "}
                      <strong>JSON</strong> کلیک کنید
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // ✅ JSON Editor Mode
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">
                  {language === "fa"
                    ? "📄 محتوای درس (JSON)"
                    : "📄 Lesson Content (JSON)"}
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-neutral-400">
                    {getSectionCount()} sections • {getVocabularyCount()} vocab
                  </span>
                  {!jsonError && jsonInput && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>
              <textarea
                value={jsonInput}
                onChange={(e) => handleJsonChange(e.target.value)}
                rows={22}
                className={`w-full px-4 py-2 border rounded-lg font-mono text-sm bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none ${
                  jsonError
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                spellCheck="false"
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    try {
                      const parsed = JSON.parse(jsonInput);
                      if (!parsed.id) throw new Error("ID is required");
                      if (!parsed.title?.fa && !parsed.title?.en) {
                        throw new Error("Title is required");
                      }
                      toast.success("✅ JSON معتبر است!");
                      setJsonError(null);
                    } catch (e) {
                      toast.error("❌ " + e.message);
                      setJsonError(e.message);
                    }
                  }}
                  className="px-3 py-1.5 text-xs bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  {language === "fa" ? "اعتبارسنجی JSON" : "Validate JSON"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sample = {
                      id: formData.id || "A1-L13",
                      level: formData.level || "A1",
                      unit: formData.unit || 1,
                      order: formData.order || 13,
                      lessonNumber: formData.lessonNumber || 13,
                      title: {
                        fa: "عنوان درس",
                        en: "Lesson Title",
                        de: "Lektionstitel",
                      },
                      subtitle: {
                        fa: "زیرعنوان",
                        en: "Subtitle",
                        de: "Untertitel",
                      },
                      description: {
                        fa: "توضیحات",
                        en: "Description",
                        de: "Beschreibung",
                      },
                      xpReward: 50,
                      perfectBonusXP: 25,
                      estimatedTime: 20,
                      difficulty: 1,
                      status: "draft",
                      isActive: true,
                      sections: [
                        {
                          type: "introduction",
                          title: {
                            fa: "معرفی",
                            en: "Introduction",
                            de: "Einführung",
                          },
                          content: {
                            fa: "متن معرفی",
                            en: "Introduction text",
                            de: "Einführungstext",
                          },
                        },
                        {
                          type: "vocabulary",
                          title: {
                            fa: "واژگان",
                            en: "Vocabulary",
                            de: "Wortschatz",
                          },
                          vocabulary: [
                            {
                              de: "Hallo",
                              fa: "سلام",
                              en: "Hello",
                              article: "der",
                            },
                          ],
                        },
                      ],
                      prerequisites: [],
                      tags: ["greetings", "basics"],
                    };
                    setJsonInput(JSON.stringify(sample, null, 2));
                    setJsonError(null);
                  }}
                  className="px-3 py-1.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                >
                  {language === "fa" ? "📋 نمونه JSON" : "📋 Sample JSON"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("آیا از پاک کردن محتوای JSON مطمئن هستید؟")) {
                      setJsonInput("{\n  \n}");
                      setJsonError(null);
                    }
                  }}
                  className="px-3 py-1.5 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition"
                >
                  🗑️ {language === "fa" ? "پاک کردن" : "Clear"}
                </button>
              </div>
              {jsonError && (
                <p className="mt-2 text-xs text-red-500">⚠️ {jsonError}</p>
              )}
            </div>
          )}

          {/* ✅ Actions */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-neutral-400">
              {viewMode === "form" ? (
                <span>
                  📝 {formData.sections?.length || 0} بخش •{" "}
                  {getVocabularyCount()} واژگان
                </span>
              ) : (
                <span>📄 حالت JSON</span>
              )}
            </div>
            <div className="flex items-center gap-3">
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
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading
                  ? language === "fa"
                    ? "در حال ذخیره..."
                    : "Saving..."
                  : lesson
                    ? language === "fa"
                      ? "💾 بروزرسانی"
                      : "💾 Update"
                    : language === "fa"
                      ? "✨ ایجاد"
                      : "✨ Create"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LessonForm;
