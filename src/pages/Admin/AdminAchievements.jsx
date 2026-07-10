/**
 * AdminAchievements.jsx
 * Path: src/pages/Admin/AdminAchievements.jsx
 * Description: Admin achievement management
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
  Award,
  Crown,
  Star,
  Medal,
} from "lucide-react";
import toast from "react-hot-toast";
import AchievementForm from "../../components/admin/AchievementForm";

const AdminAchievements = () => {
  const { language } = useLanguageContext();
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/achievements");
      setAchievements(response?.data?.data || response?.data || []);
    } catch (error) {
      toast.error("خطا در بارگذاری دستاوردها");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("آیا از حذف این دستاورد مطمئن هستید؟")) return;
    try {
      await api.delete(`/admin/achievements/${id}`);
      toast.success("دستاورد با موفقیت حذف شد");
      loadAchievements();
    } catch (error) {
      toast.error("خطا در حذف دستاورد");
    }
  };

  const handleEdit = (achievement) => {
    setEditingAchievement(achievement);
    setShowForm(true);
  };

  const getTierIcon = (tier) => {
    const icons = {
      bronze: <Medal className="w-4 h-4 text-amber-600" />,
      silver: <Medal className="w-4 h-4 text-gray-400" />,
      gold: <Crown className="w-4 h-4 text-yellow-500" />,
      diamond: <Star className="w-4 h-4 text-blue-400" />,
    };
    return icons[tier] || <Award className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const filteredAchievements = achievements.filter((achievement) => {
    const title = achievement.title?.[language] || achievement.title || "";
    return title.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-primary-500" />
            {language === "fa" ? "مدیریت دستاوردها" : "Achievement Management"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {language === "fa"
              ? `مدیریت ${achievements.length} دستاورد`
              : `Managing ${achievements.length} achievements`}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition"
        >
          <Plus className="w-4 h-4" />
          {language === "fa" ? "دستاورد جدید" : "New Achievement"}
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={
              language === "fa" ? "جستجوی دستاورد..." : "Search achievements..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
        </div>
        <button
          onClick={loadAchievements}
          className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <RefreshCw className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  {getTierIcon(achievement.tier)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {achievement.title?.[language] ||
                      achievement.title ||
                      "بدون عنوان"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {achievement.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                      {achievement.category || "learning"}
                    </span>
                    <span className="text-xs text-amber-500">
                      +{achievement.xpReward || 50} XP
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(achievement)}
                  className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                >
                  <Edit className="w-4 h-4 text-blue-500" />
                </button>
                <button
                  onClick={() => handleDelete(achievement.id)}
                  className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
              {achievement.description?.[language] ||
                achievement.description ||
                ""}
            </p>
            <div className="mt-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  achievement.isActive
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                }`}
              >
                {achievement.isActive
                  ? language === "fa"
                    ? "فعال"
                    : "Active"
                  : language === "fa"
                    ? "غیرفعال"
                    : "Inactive"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <AchievementForm
          achievement={editingAchievement}
          onClose={() => {
            setShowForm(false);
            setEditingAchievement(null);
          }}
          onSuccess={() => {
            loadAchievements();
            setShowForm(false);
            setEditingAchievement(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminAchievements;
