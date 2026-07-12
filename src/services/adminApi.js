/**
 * adminApi.js
 * Path: src/services/adminApi.js
 * Description: Admin API service
 * Changes:
 * - ✅ FIXED: All methods properly handle response
 */

import api from "./api";

const adminApi = {
  // ============================================
  // 📊 Dashboard
  // ============================================
  getDashboard: () => api.get("/admin/dashboard"),

  // ============================================
  // 👥 Users
  // ============================================
  getUsers: (params = {}) => api.get("/admin/users", { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  updateUserStatus: (id, isActive) =>
    api.put(`/admin/users/${id}/status`, { isActive }),

  // ============================================
  // 📚 Lessons
  // ============================================
  getLessons: (params = {}) => api.get("/admin/lessons", { params }),
  createLesson: (data) => api.post("/admin/lessons", data),
  updateLesson: (id, data) => api.put(`/admin/lessons/${id}`, data),
  deleteLesson: (id) => api.delete(`/admin/lessons/${id}`),

  // ============================================
  // 🏋️ Exercises
  // ============================================
  getExercises: (params = {}) => api.get("/admin/exercises", { params }),
  createExercise: (data) => api.post("/admin/exercises", data),
  updateExercise: (id, data) => api.put(`/admin/exercises/${id}`, data),
  deleteExercise: (id) => api.delete(`/admin/exercises/${id}`),

  // ============================================
  // 🏆 Achievements
  // ============================================
  getAchievements: (params = {}) => api.get("/admin/achievements", { params }),
  createAchievement: (data) => api.post("/admin/achievements", data),
  updateAchievement: (id, data) => api.put(`/admin/achievements/${id}`, data),
  deleteAchievement: (id) => api.delete(`/admin/achievements/${id}`),

  // ============================================
  // 📈 Analytics
  // ============================================
  getAnalytics: (range = "7d") =>
    api.get("/admin/analytics", { params: { range } }),

  // ============================================
  // 🎫 Tickets
  // ============================================
  getTickets: (params = {}) => api.get("/admin/tickets", { params }),
  getTicketStats: () => api.get("/admin/tickets/stats"),
  getTicket: (id) => api.get(`/admin/tickets/${id}`),
  replyTicket: (id, reply, status) =>
    api.post(`/admin/tickets/${id}/reply`, { reply, status }),
  updateTicketStatus: (id, data) =>
    api.put(`/admin/tickets/${id}/status`, data),

  // ============================================
  // ⚙️ Settings
  // ============================================
  getSettings: () => api.get("/admin/settings"),
  updateSettings: (settings) => api.put("/admin/settings", { settings }),
  getFeatureFlags: () => api.get("/admin/settings/features"),
  updateFeatureFlags: (flags) => api.put("/admin/settings/features", { flags }),

  // ============================================
  // 🩺 Health
  // ============================================
  getSystemHealth: () => api.get("/admin/health"),
};

export default adminApi;
