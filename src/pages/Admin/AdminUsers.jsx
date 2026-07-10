/**
 * AdminUsers.jsx
 * Path: src/pages/Admin/AdminUsers.jsx
 * Description: Admin user management
 */

import React, { useState, useEffect } from "react";
import { useLanguageContext } from "../../context/LanguageContext";
import api from "../../services/api";
import {
  Search,
  RefreshCw,
  Loader2,
  Users,
  Edit,
  Trash2,
  User,
  Mail,
  Calendar,
  Star,
  Award,
  Eye, // ✅ ADDED: Eye icon
} from "lucide-react";
import toast from "react-hot-toast";
import UserDetail from "../../components/admin/UserDetail";

const AdminUsers = () => {
  const { language } = useLanguageContext();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/users");
      setUsers(response?.data?.data || response?.data || []);
    } catch (error) {
      toast.error("خطا در بارگذاری کاربران");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("آیا از حذف این کاربر مطمئن هستید؟")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("کاربر با موفقیت حذف شد");
      loadUsers();
    } catch (error) {
      toast.error("خطا در حذف کاربر");
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowDetail(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const filteredUsers = users.filter((user) => {
    const name = user.name || "";
    const email = user.email || "";
    const query = search.toLowerCase();
    return (
      name.toLowerCase().includes(query) || email.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-primary-500" />
            {language === "fa" ? "مدیریت کاربران" : "User Management"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {language === "fa"
              ? `مدیریت ${users.length} کاربر`
              : `Managing ${users.length} users`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={
              language === "fa" ? "جستجوی کاربر..." : "Search users..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
        </div>
        <button
          onClick={loadUsers}
          className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <RefreshCw className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {language === "fa" ? "هیچ کاربری یافت نشد" : "No users found"}
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
                    {language === "fa" ? "نام" : "Name"}
                  </th>
                  <th className="text-left px-4 py-3 text-gray-600 dark:text-gray-400">
                    Email
                  </th>
                  <th className="text-center px-4 py-3 text-gray-600 dark:text-gray-400">
                    XP
                  </th>
                  <th className="text-center px-4 py-3 text-gray-600 dark:text-gray-400">
                    {language === "fa" ? "سطح" : "Level"}
                  </th>
                  <th className="text-center px-4 py-3 text-gray-600 dark:text-gray-400">
                    {language === "fa" ? "گل‌زنی" : "Streak"}
                  </th>
                  <th className="text-center px-4 py-3 text-gray-600 dark:text-gray-400">
                    {language === "fa" ? "نقش" : "Role"}
                  </th>
                  <th className="text-right px-4 py-3 text-gray-600 dark:text-gray-400">
                    {language === "fa" ? "عملیات" : "Actions"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                  >
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 font-medium">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="hover:text-primary-500 transition flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        {user.name || "بدون نام"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{user.email}</td>
                    <td className="px-4 py-3 text-center font-bold">
                      {user.xp || 0}
                    </td>
                    <td className="px-4 py-3 text-center">{user.level || 1}</td>
                    <td className="px-4 py-3 text-center">
                      {user.streak || 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          user.role === "admin"
                            ? "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {user.role || "user"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                          title="View User"
                        >
                          <Eye className="w-4 h-4 text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                          title="Delete User"
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

      {showDetail && selectedUser && (
        <UserDetail
          user={selectedUser}
          onClose={() => {
            setShowDetail(false);
            setSelectedUser(null);
          }}
          onUpdate={() => {
            loadUsers();
            setShowDetail(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminUsers;
