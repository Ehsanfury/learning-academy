import api from "./api";

const notificationApi = {
  getNotifications: async (page = 1, limit = 20) => {
    return api.get("/notifications", { params: { page, limit } });
  },

  markAsRead: async (notificationId) => {
    return api.put(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async () => {
    return api.put("/notifications/read-all");
  },

  getUnreadCount: async () => {
    return api.get("/notifications/unread-count");
  },

  updatePreferences: async (preferences) => {
    return api.put("/notifications/preferences", preferences);
  },
};

export default notificationApi;
