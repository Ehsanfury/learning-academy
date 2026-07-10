/**
 * AdminExercises.jsx
 * Path: src/pages/Admin/AdminExercises.jsx
 * Description: Admin exercise management
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
  Dumbbell,
} from "lucide-react";
import toast from "react-hot-toast";
import ExerciseForm from "../../components/admin/ExerciseForm";

const AdminExercises = () => {
  const { language } = useLanguageContext();
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/exercises");
      setExercises(response?.data?.data || response?.data || []);
    } catch (error) {
      toast.error("خطا در بارگذاری تمرینات");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("آیا از حذف این تمرین مطمئن هستید؟")) return;
    try {
      await api.delete(`/admin/exercises/${id}`);
      toast.success("تمرین با موفقیت حذف شد");
      loadExercises();
    } catch (error) {
      toast.error("خطا در حذف تمرین");
    }
  };

  const handleEdit = (exercise) => {
    setEditingExercise(exercise);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const filteredExercises = exercises.filter((exercise) => {
    const title = exercise.title?.[language] || exercise.title || "";
    return title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-primary-500" />
            {language === "fa" ? "مدیریت تمرینات" : "Exercise Management"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {language === "fa"
              ? `مدیریت ${exercises.length} تمرین`
              : `Managing ${exercises.length} exercises`}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
        >
          <Plus className="w-4 h-4" />
          {language === "fa" ? "تمرین جدید" : "New Exercise"}
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={
              language === "fa" ? "جستجوی تمرین..." : "Search exercises..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
        </div>
        <button
          onClick={loadExercises}
          className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <RefreshCw className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredExercises.length === 0 ? (
          <div className="text-center py-12">
            <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {language === "fa" ? "هیچ تمرینی یافت نشد" : "No exercises found"}
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
                    {language === "fa" ? "نوع" : "Type"}
                  </th>
                  <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400">
                    Level
                  </th>
                  <th className="text-right px-4 py-3 text-gray-600 dark:text-gray-400">
                    {language === "fa" ? "عملیات" : "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredExercises.map((exercise, index) => (
                  <tr
                    key={exercise.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                  >
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 font-medium">
                      {exercise.title?.[language] ||
                        exercise.title ||
                        "بدون عنوان"}
                    </td>
                    <td className="px-4 py-3">{exercise.type || "mixed"}</td>
                    <td className="px-4 py-3">{exercise.level || "A1"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(exercise)}
                          className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                        >
                          <Edit className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(exercise.id)}
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

      {showForm && (
        <ExerciseForm
          exercise={editingExercise}
          onClose={() => {
            setShowForm(false);
            setEditingExercise(null);
          }}
          onSuccess={() => {
            loadExercises();
            setShowForm(false);
            setEditingExercise(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminExercises;
