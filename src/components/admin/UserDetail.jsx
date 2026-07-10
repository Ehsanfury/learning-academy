/**
 * UserDetail.jsx
 * Path: src/components/admin/UserDetail.jsx
 * Description: User detail view with edit capability
 */

import React, { useState } from "react";
import { useLanguageContext } from "../../context/LanguageContext";
import api from "../../services/api";
import {
  X,
  Loader2,
  User,
  Mail,
  Calendar,
  Award,
  Star,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";

const UserDetail = ({ user, onClose, onUpdate }) => {
  const { language } = useLanguageContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "user",
    xp: user?.xp || 0,
    level: user?.level || 1,
    streak: user?.streak || 0,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.put(`/admin/users/${user.id}`, formData);
      toast.success("کاربر با موفقیت بروزرسانی شد");
      onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.message || "خطا در بروزرسانی کاربر");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-primary-500" />
            {language === "fa" ? "جزئیات کاربر" : "User Details"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* User Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p className="text-xs text-gray-500">
                {language === "fa" ? "نام" : "Name"}
              </p>
              <p className="font-medium">{user.name || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">
                {language === "fa" ? "نقش" : "Role"}
              </p>
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  user.role === "admin"
                    ? "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                {user.role || "user"}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500">
                {language === "fa" ? "تاریخ ثبت‌نام" : "Joined"}
              </p>
              <p className="font-medium text-sm">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-500">{user.xp || 0}</p>
              <p className="text-xs text-gray-500">XP</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-500">
                {user.level || 1}
              </p>
              <p className="text-xs text-gray-500">
                {language === "fa" ? "سطح" : "Level"}
              </p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
              <p className="text-2xl font-bold text-orange-500">
                {user.streak || 0}
              </p>
              <p className="text-xs text-gray-500">
                {language === "fa" ? "گل‌زنی" : "Streak"}
              </p>
            </div>
          </div>

          {/* Edit Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4"
          >
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {language === "fa" ? "ویرایش کاربر" : "Edit User"}
            </h3>

            <div>
              <label className="block text-sm font-medium mb-1">
                {language === "fa" ? "نام" : "Name"}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {language === "fa" ? "نقش" : "Role"}
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {language === "fa" ? "سطح" : "Level"}
                </label>
                <input
                  type="number"
                  value={formData.level}
                  onChange={(e) =>
                    handleChange("level", parseInt(e.target.value))
                  }
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  min={1}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">XP</label>
                <input
                  type="number"
                  value={formData.xp}
                  onChange={(e) => handleChange("xp", parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  {language === "fa" ? "گل‌زنی" : "Streak"}
                </label>
                <input
                  type="number"
                  value={formData.streak}
                  onChange={(e) =>
                    handleChange("streak", parseInt(e.target.value))
                  }
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  min={0}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                {language === "fa" ? "بستن" : "Close"}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {language === "fa" ? "ذخیره تغییرات" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
