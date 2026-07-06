/**
 * NotificationsPage.jsx
 * Path: src/pages/Notifications/NotificationsPage.jsx
 * Description: Notifications page with real API
 * Changes:
 * - L21: Replaced mock notifications with real API
 * - Fixed: debug import position
 */

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Trash2,
  CheckCheck,
} from "lucide-react";
import { useLanguageContext } from "../../context/LanguageContext";
import api from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";
import debug from "../../utils/debug";

const NotificationsPage = () => {
  const { language, t } = useLanguageContext();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // ✅ L21: Fetch real notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/notifications");

      if (response.data?.data) {
        setNotifications(response.data.data);
      } else if (Array.isArray(response.data)) {
        setNotifications(response.data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      debug.error("Failed to fetch notifications:", error);
      setError(error.message || "Failed to load notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark as read
  const markAsRead = useCallback(
    async (id) => {
      try {
        await api.put(`/notifications/${id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
        toast.success(t("notifications.marked_read", "Marked as read"));
      } catch (error) {
        debug.error("Failed to mark as read:", error);
        toast.error(t("notifications.error", "Failed to mark as read"));
      }
    },
    [t],
  );

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setSelectedIds([]);
      toast.success(
        t("notifications.all_read", "All notifications marked as read"),
      );
    } catch (error) {
      debug.error("Failed to mark all as read:", error);
      toast.error(t("notifications.error", "Failed to mark all as read"));
    }
  }, [t]);

  // Delete notification
  const deleteNotification = useCallback(
    async (id) => {
      try {
        await api.delete(`/notifications/${id}`);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setSelectedIds((prev) => prev.filter((sid) => sid !== id));
        toast.success(t("notifications.deleted", "Notification deleted"));
      } catch (error) {
        debug.error("Failed to delete notification:", error);
        toast.error(t("notifications.error", "Failed to delete notification"));
      }
    },
    [t],
  );

  // Delete all read notifications
  const deleteAllRead = useCallback(async () => {
    try {
      await api.delete("/notifications/read");
      setNotifications((prev) => prev.filter((n) => !n.isRead));
      setSelectedIds([]);
      toast.success(
        t("notifications.deleted_all", "All read notifications deleted"),
      );
    } catch (error) {
      debug.error("Failed to delete read notifications:", error);
      toast.error(t("notifications.error", "Failed to delete notifications"));
    }
  }, [t]);

  // Get icon based on notification type
  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "info":
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  // Get time ago
  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t("notifications.just_now", "Just now");
    if (minutes < 60) return `${minutes}m ${t("notifications.ago", "ago")}`;
    if (hours < 24) return `${hours}h ${t("notifications.ago", "ago")}`;
    return `${days}d ${t("notifications.ago", "ago")}`;
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchNotifications}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          {t("common.retry", "Retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-indigo-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("notifications.title", "Notifications")}
          </h1>
          {unreadCount > 0 && (
            <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              icon={CheckCheck}
              iconPosition="left"
            >
              {t("notifications.mark_all_read", "Mark all as read")}
            </Button>
          )}
          {notifications.some((n) => n.isRead) && (
            <Button
              variant="danger"
              size="sm"
              onClick={deleteAllRead}
              icon={Trash2}
              iconPosition="left"
            >
              {t("notifications.delete_read", "Delete read")}
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
          <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {t("notifications.empty", "No notifications")}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {t("notifications.empty_hint", "You're all caught up!")}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                flex items-start gap-3 p-4 rounded-xl border transition-all
                ${
                  notification.isRead
                    ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    : "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800"
                }
                hover:shadow-sm transition-shadow
              `}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(notification.type || "info")}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p
                      className={`font-medium ${notification.isRead ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-white"}`}
                    >
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {notification.message}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap flex-shrink-0">
                    {timeAgo(notification.createdAt || notification.timestamp)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-2">
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      {t("notifications.mark_read", "Mark as read")}
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="text-xs text-gray-400 hover:text-red-500 transition"
                  >
                    {t("common.delete", "Delete")}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
