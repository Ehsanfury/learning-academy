/**
 * AdminLessons.jsx
 * Path: src/pages/Admin/AdminLessons.jsx
 * Description: Admin lessons management with JSON editor
 * Version: 2.1 - Fixed API endpoints
 * Features:
 * - ✅ Lessons list with search/filter
 * - ✅ Inline JSON editor
 * - ✅ Create new lesson
 * - ✅ Edit lesson content
 * - ✅ Publish/unpublish using correct endpoint
 * - ✅ Delete with confirmation
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Code,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  FileJson,
} from "lucide-react";
import api from "../../services/api";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import Dialog from "../../components/ui/Dialog";
import Skeleton from "../../components/ui/Skeleton";
import EmptyState from "../../components/ui/EmptyState";
import { useToast } from "../../components/ui/Toast";
import { cn } from "../../utils/helpers";

const AdminLessons = () => {
  const toast = useToast();
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [editingLesson, setEditingLesson] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editorMode, setEditorMode] = useState("form");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [lessonForm, setLessonForm] = useState(null);
  const [jsonContent, setJsonContent] = useState("");
  const [jsonError, setJsonError] = useState(null);

  // ============================================
  // 📡 Fetch Lessons
  // ============================================

  const fetchLessons = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/admin/lessons");
      if (response.data.success) {
        setLessons(response.data.data || []);
      }
    } catch (err) {
      toast.error("خطا در بارگذاری درس‌ها");
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  // ============================================
  // 🔍 Filter
  // ============================================

  const filteredLessons = lessons.filter((lesson) => {
    if (levelFilter !== "all" && lesson.level !== levelFilter) return false;
    if (search) {
      const term = search.toLowerCase();
      return (
        lesson.id?.toLowerCase().includes(term) ||
        lesson.title?.fa?.toLowerCase().includes(term) ||
        lesson.title?.en?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  // ============================================
  // ✏️ Open Editor
  // ============================================

  const handleOpenEditor = (lesson = null) => {
    if (lesson) {
      setEditingLesson(lesson);
      setLessonForm({ ...lesson });
      setJsonContent(JSON.stringify(lesson, null, 2));
    } else {
      setEditingLesson(null);
      setLessonForm({
        id: "",
        title: { fa: "", en: "", de: "" },
        level: "A1",
        order: lessons.length + 1,
        isActive: true,
        sections: [],
      });
      setJsonContent("");
    }
    setEditorMode("form");
    setShowEditor(true);
  };

  // ============================================
  // 💾 Save Lesson
  // ============================================

  const handleSaveLesson = async () => {
    try {
      let data = lessonForm;

      if (editorMode === "json") {
        try {
          data = JSON.parse(jsonContent);
          setJsonError(null);
        } catch (err) {
          setJsonError("JSON نامعتبر: " + err.message);
          return;
        }
      }

      if (editingLesson) {
        await api.put(`/admin/lessons/${editingLesson.id}`, data);
        toast.success("درس به‌روزرسانی شد");
      } else {
        await api.post("/admin/lessons", data);
        toast.success("درس جدید ایجاد شد");
      }

      setShowEditor(false);
      fetchLessons();
    } catch (err) {
      toast.error("خطا در ذخیره درس");
    }
  };

  // ============================================
  // 🗑️ Delete Lesson
  // ============================================

  const handleDeleteLesson = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/lessons/${deleteTarget.id}`);
      toast.success("درس حذف شد");
      setDeleteTarget(null);
      fetchLessons();
    } catch (err) {
      toast.error("خطا در حذف درس");
    }
  };

  // ============================================
  // 🔄 Toggle Publish - ✅ FIXED
  // ============================================

  const handleTogglePublish = async (lesson) => {
    try {
      const newStatus = lesson.status === "published" ? "draft" : "published";
      // ✅ FIXED: استفاده از endpoint صحیح
      await api.post(`/admin/lessons/${lesson.id}/status`, {
        status: newStatus,
      });
      toast.success(
        lesson.status === "published" ? "درس غیرفعال شد" : "درس منتشر شد",
      );
      fetchLessons();
    } catch (err) {
      toast.error("خطا در تغییر وضعیت");
    }
  };

  // ============================================
  // 🔄 Switch Editor Mode
  // ============================================

  const handleSwitchMode = (mode) => {
    if (mode === "json" && editorMode === "form") {
      setJsonContent(JSON.stringify(lessonForm, null, 2));
    } else if (mode === "form" && editorMode === "json") {
      try {
        const parsed = JSON.parse(jsonContent);
        setLessonForm(parsed);
        setJsonError(null);
      } catch (err) {
        setJsonError("JSON نامعتبر است. نمی‌توان به حالت فرم بازگشت.");
        return;
      }
    }
    setEditorMode(mode);
  };

  // ============================================
  // 🖼️ Render
  // ============================================

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton variant="title" />
        <Skeleton variant="card" count={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">مدیریت درس‌ها</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {lessons.length} درس موجود
          </p>
        </div>

        <Button icon={Plus} onClick={() => handleOpenEditor()}>
          درس جدید
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="جستجوی درس..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
            clearable
            onClear={() => setSearch("")}
          />
        </div>

        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm"
        >
          <option value="all">همه سطوح</option>
          <option value="A1">A1</option>
          <option value="A2">A2</option>
          <option value="B1">B1</option>
          <option value="B2">B2</option>
          <option value="C1">C1</option>
          <option value="C2">C2</option>
        </select>
      </div>

      {/* Lessons List */}
      {filteredLessons.length === 0 ? (
        <EmptyState
          icon={FileJson}
          title="درسی یافت نشد"
          description="اولین درس را ایجاد کنید یا فیلترها را تغییر دهید"
          actionLabel="ایجاد درس جدید"
          onAction={() => handleOpenEditor()}
        />
      ) : (
        <Card padding="none" className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-neutral-50 dark:bg-neutral-800/50">
              <tr>
                <th className="p-3 text-right text-xs font-medium text-neutral-500">
                  ID
                </th>
                <th className="p-3 text-right text-xs font-medium text-neutral-500">
                  عنوان
                </th>
                <th className="p-3 text-right text-xs font-medium text-neutral-500">
                  سطح
                </th>
                <th className="p-3 text-right text-xs font-medium text-neutral-500">
                  ترتیب
                </th>
                <th className="p-3 text-right text-xs font-medium text-neutral-500">
                  وضعیت
                </th>
                <th className="p-3 text-right text-xs font-medium text-neutral-500">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLessons.map((lesson) => (
                <tr
                  key={lesson.id}
                  className="border-t border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/30"
                >
                  <td className="p-3 text-xs font-mono">{lesson.id}</td>
                  <td className="p-3 text-sm">
                    {lesson.title?.fa || lesson.title?.en}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-950 text-primary-600 rounded text-xs">
                      {lesson.level}
                    </span>
                  </td>
                  <td className="p-3 text-sm">{lesson.order}</td>
                  <td className="p-3">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-xs",
                        lesson.status === "published"
                          ? "bg-success-100 text-success-700 dark:bg-success-950 dark:text-success-400"
                          : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
                      )}
                    >
                      {lesson.status === "published" ? "منتشر شده" : "پیش‌نویس"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        iconOnly
                        icon={Edit}
                        onClick={() => handleOpenEditor(lesson)}
                        ariaLabel="ویرایش"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        iconOnly
                        icon={lesson.status === "published" ? EyeOff : Eye}
                        onClick={() => handleTogglePublish(lesson)}
                        ariaLabel={
                          lesson.status === "published"
                            ? "غیرفعال‌سازی"
                            : "انتشار"
                        }
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        iconOnly
                        icon={Trash2}
                        onClick={() => setDeleteTarget(lesson)}
                        ariaLabel="حذف"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Editor Modal */}
      <Modal
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        title={editingLesson ? `ویرایش درس: ${editingLesson.id}` : "درس جدید"}
        size="2xl"
      >
        <div className="space-y-4">
          {/* Mode Switcher */}
          <div className="flex gap-2">
            <Button
              variant={editorMode === "form" ? "primary" : "secondary"}
              size="sm"
              onClick={() => handleSwitchMode("form")}
            >
              ویرایشگر فرم
            </Button>
            <Button
              variant={editorMode === "json" ? "primary" : "secondary"}
              size="sm"
              icon={Code}
              onClick={() => handleSwitchMode("json")}
            >
              ویرایشگر JSON
            </Button>
          </div>

          {/* Form Mode */}
          {editorMode === "form" && lessonForm && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="شناسه درس"
                  value={lessonForm.id || ""}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, id: e.target.value })
                  }
                  disabled={Boolean(editingLesson)}
                />
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                    سطح
                  </label>
                  <select
                    value={lessonForm.level || "A1"}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, level: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                  >
                    {["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Input
                label="عنوان (فارسی)"
                value={lessonForm.title?.fa || ""}
                onChange={(e) =>
                  setLessonForm({
                    ...lessonForm,
                    title: { ...lessonForm.title, fa: e.target.value },
                  })
                }
              />

              <Input
                label="عنوان (انگلیسی)"
                value={lessonForm.title?.en || ""}
                onChange={(e) =>
                  setLessonForm({
                    ...lessonForm,
                    title: { ...lessonForm.title, en: e.target.value },
                  })
                }
              />

              <Input
                label="ترتیب"
                type="number"
                value={lessonForm.order || 0}
                onChange={(e) =>
                  setLessonForm({
                    ...lessonForm,
                    order: parseInt(e.target.value) || 0,
                  })
                }
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={lessonForm.isActive}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, isActive: e.target.checked })
                  }
                />
                <label htmlFor="isActive" className="text-sm">
                  منتشر شده
                </label>
              </div>
            </div>
          )}

          {/* JSON Mode */}
          {editorMode === "json" && (
            <div className="space-y-2">
              <textarea
                value={jsonContent}
                onChange={(e) => setJsonContent(e.target.value)}
                rows={20}
                className="w-full p-4 rounded-xl border-2 border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 font-mono text-sm"
                dir="ltr"
              />
              {jsonError && (
                <p className="text-sm text-danger-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {jsonError}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <Button variant="secondary" onClick={() => setShowEditor(false)}>
              انصراف
            </Button>
            <Button variant="primary" icon={Save} onClick={handleSaveLesson}>
              ذخیره
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Dialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteLesson}
        title="حذف درس"
        message={`آیا از حذف درس "${deleteTarget?.title?.fa || deleteTarget?.id}" مطمئن هستید؟ این عمل قابل بازگشت نیست.`}
        variant="danger"
        confirmText="حذف"
      />
    </div>
  );
};

export default AdminLessons;
