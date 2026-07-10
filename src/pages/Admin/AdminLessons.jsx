/**
 * AdminLessons.jsx
 * Path: src/pages/Admin/AdminLessons.jsx
 * Description: Admin lesson management
 */

import React, { useState, useEffect } from "react";
import { useLanguageContext } from "../../context/LanguageContext";
import api from "../../services/api";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  BookOpen,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import LessonForm from "../../components/admin/LessonForm";

const AdminLessons = () => {
  const { language } = useLanguageContext();
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/lessons");
      setLessons(response?.data?.data || response?.data || []);
    } catch (error) {
      toast.error("خطا در بارگذاری درس‌ها");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("آیا از حذف این درس مطمئن هستید؟")) return;
    try {
      await api.delete(`/admin/lessons/${id}`);
      toast.success("درس با موفقیت حذف شد");
      loadLessons();
    } catch (error) {
      toast.error("خطا در حذف درس");
    }
  };

  const handleEdit = (lesson) => {
    setEditingLesson(lesson);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingLesson(null);
    loadLessons();
  };

  const getStatusBadge = (status) => {
    const configs = {
      published: { color: "bg-green-100 text-green-700", icon: CheckCircle },
      draft: { color: "bg-yellow-100 text-yellow-700", icon: AlertCircle },
      archived: { color: "bg-gray-100 text-gray-700", icon: XCircle },
    };
    const config = configs[status] || configs.draft;
    const Icon = config.icon;
    return (
      <span
        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {language === "fa"
          ? { published: "منتشر شده", draft: "پیش‌نویس", archived: "بایگانی" }[
              status
            ] || status
          : status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const filteredLessons = lessons.filter((lesson) => {
    const title = lesson.title?.[language] || lesson.title?.fa || "";
    return title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary-500" />
            {language === "fa" ? "مدیریت درس‌ها" : "Lesson Management"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {language === "fa"
              ? `مدیریت ${lessons.length} درس`
              : `Managing ${lessons.length} lessons`}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
        >
          <Plus className="w-4 h-4" />
          {language === "fa" ? "درس جدید" : "New Lesson"}
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={
              language === "fa" ? "جستجوی درس..." : "Search lessons..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
        </div>
        <button
          onClick={loadLessons}
          className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <RefreshCw className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Lessons List */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredLessons.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {language === "fa" ? "هیچ درسی یافت نشد" : "No lessons found"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400">
                    #
                  </th>
                  <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400">
                    {language === "fa" ? "عنوان" : "Title"}
                  </th>
                  <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400">
                    Level
                  </th>
                  <th className="text-center px-4 py-3 text-gray-600 dark:text-gray-400">
                    XP
                  </th>
                  <th className="text-center px-4 py-3 text-gray-600 dark:text-gray-400">
                    {language === "fa" ? "بخش‌ها" : "Sections"}
                  </th>
                  <th className="text-center px-4 py-3 text-gray-600 dark:text-gray-400">
                    {language === "fa" ? "وضعیت" : "Status"}
                  </th>
                  <th className="text-right px-4 py-3 text-gray-600 dark:text-gray-400">
                    {language === "fa" ? "عملیات" : "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLessons.map((lesson, index) => (
                  <tr
                    key={lesson.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                  >
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 font-medium">
                      {lesson.title?.[language] ||
                        lesson.title?.fa ||
                        "بدون عنوان"}
                    </td>
                    <td className="px-4 py-3">{lesson.level || "A1"}</td>
                    <td className="px-4 py-3 text-center">
                      {lesson.xpReward || 50}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {lesson.totalSections || 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getStatusBadge(lesson.status)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(lesson)}
                          className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                        >
                          <Edit className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(lesson.id)}
                          className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lesson Form Modal */}
      {showForm && (
        <LessonForm
          lesson={editingLesson}
          onClose={handleFormClose}
          onSuccess={() => {
            loadLessons();
            setShowForm(false);
            setEditingLesson(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminLessons;
