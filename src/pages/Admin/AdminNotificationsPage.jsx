/**
 * AdminNotificationsPage.jsx
 * مدیریت نوتیفیکیشن‌ها
 */

import { useState, useEffect } from "react";
import { useLanguageContext } from "../../context/LanguageContext";
import api from "../../services/api";
import { Plus, Bell, Trash2, Eye, Send, Loader2 } from "lucide-react";
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
      setNotifications(response?.data?.data || response?.data || []);
    } catch (error) {
      toast.error("خطا در بارگذاری نوتیفیکیشن‌ها");
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
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
          {language === "fa" ? "مدیریت نوتیفیکیشن‌ها" : "Notifications"}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg flex items-center gap-2 hover:bg-primary-600"
        >
          <Plus className="w-4 h-4" />
          {language === "fa" ? "نوتیفیکیشن جدید" : "New Notification"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white">
                  {notif.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{notif.message}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${notif.type === "info" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {notif.type}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(notif.id)}
                className="p-2 hover:bg-red-100 rounded-lg"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full">
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
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
                required
              />
              <textarea
                placeholder={language === "fa" ? "متن پیام" : "Message"}
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
                required
              />
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
              </select>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 rounded-lg"
                >
                  {language === "fa" ? "انصراف" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg"
                >
                  <Send className="w-4 h-4 inline mr-1" />
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
