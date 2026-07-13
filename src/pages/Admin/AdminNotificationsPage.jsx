/**
 * AdminNotificationsPage.jsx
 * Path: src/pages/Admin/AdminNotificationsPage.jsx
 * Description: مدیریت نوتیفیکیشن‌ها
 * Changes:
 * - ✅ FIXED: Objects are not valid as React child - using getLocalizedText
 */

import { useState, useEffect } from "react";
import { useLanguageContext } from "../../context/LanguageContext";
import { getLocalizedText } from "../../utils/i18n";
import api from "../../services/api";
import { Plus, Bell, Trash2, Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

function AdminNotificationsPage() {
  const { language } = useLanguageContext();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    isGlobal: true,
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/notifications");
      const data = response?.data?.data || response?.data || [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("خطا در بارگذاری نوتیفیکیشن‌ها");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/notifications", formData);
      toast.success("نوتیفیکیشن ارسال شد");
      setShowForm(false);
      setFormData({ title: "", message: "", type: "info", isGlobal: true });
      loadNotifications();
    } catch (error) {
      toast.error("خطا در ارسال نوتیفیکیشن");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("آیا از حذف این نوتیفیکیشن مطمئن هستید؟")) return;
    try {
      await api.delete(`/admin/notifications/${id}`);
      toast.success("نوتیفیکیشن حذف شد");
      loadNotifications();
    } catch (error) {
      toast.error("خطا در حذف نوتیفیکیشن");
    }
  };

  // ✅ Helper: دریافت متن بومی‌سازی شده
  const getLocalized = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      return getLocalizedText(value, language, "");
    }
    return String(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary-500" />
          {language === "fa" ? "مدیریت نوتیفیکیشن‌ها" : "Notifications"}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg flex items-center gap-2 hover:bg-primary-600 transition"
        >
          <Plus className="w-4 h-4" />
          {language === "fa" ? "نوتیفیکیشن جدید" : "New Notification"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-neutral-400 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
            <Bell className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
            <p>
              {language === "fa"
                ? "هیچ نوتیفیکیشنی وجود ندارد"
                : "No notifications"}
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-neutral-900 dark:text-white">
                      {getLocalized(notif.title)}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        notif.type === "info"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : notif.type === "warning"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : notif.type === "success"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {notif.type || "info"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {getLocalized(notif.message)}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    {notif.isGlobal ? (
                      <span className="text-xs text-green-500">
                        🌍 {language === "fa" ? "همگانی" : "Global"}
                      </span>
                    ) : (
                      <span className="text-xs text-blue-500">
                        👤 {language === "fa" ? "اختصاصی" : "Specific"}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {notif.createdAt
                        ? new Date(notif.createdAt).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(notif.id)}
                  className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold mb-4">
              {language === "fa" ? "نوتیفیکیشن جدید" : "New Notification"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder={language === "fa" ? "عنوان" : "Title"}
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                required
              />
              <textarea
                placeholder={language === "fa" ? "متن پیام" : "Message"}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                required
              />
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
                <option value="promotion">Promotion</option>
                <option value="system">System</option>
              </select>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isGlobal"
                  checked={formData.isGlobal}
                  onChange={(e) =>
                    setFormData({ ...formData, isGlobal: e.target.checked })
                  }
                  className="w-4 h-4 text-primary-500"
                />
                <label htmlFor="isGlobal" className="text-sm">
                  {language === "fa"
                    ? "ارسال به همه کاربران"
                    : "Send to all users"}
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  {language === "fa" ? "انصراف" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {language === "fa" ? "ارسال" : "Send"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminNotificationsPage;
