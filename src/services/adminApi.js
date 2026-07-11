/**
 * adminApi.js
 * German Academy — Frontend API برای پنل ادمین
 */

import api from "./api";

const adminApi = {
  // ============================================
  // 📊 داشبورد
  // ============================================
  getDashboard: () => api.get("/admin/dashboard"),

  // ============================================
  // 👥 کاربران
  // ============================================
  getUsers: (params = {}) => api.get("/admin/users", { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  updateUserStatus: (id, isActive) =>
    api.put(`/admin/users/${id}/status`, { isActive }),

  // ============================================
  // 📚 دروس
  // ============================================
  getLessons: (params = {}) => api.get("/admin/lessons", { params }),
  createLesson: (data) => api.post("/admin/lessons", data),
  updateLesson: (id, data) => api.put(`/admin/lessons/${id}`, data),
  deleteLesson: (id) => api.delete(`/admin/lessons/${id}`),

  // ============================================
  // 📈 آمار بازدید
  // ============================================
  getAnalytics: (range = "7d") =>
    api.get("/admin/analytics", { params: { range } }),

  // ============================================
  // 🎫 تیکت‌ها
  // ============================================
  getTickets: (params = {}) => api.get("/admin/tickets", { params }),
  getTicketStats: () => api.get("/admin/tickets/stats"),
  getTicket: (id) => api.get(`/admin/tickets/${id}`),
  replyTicket: (id, reply, status) =>
    api.post(`/admin/tickets/${id}/reply`, { reply, status }),
  updateTicketStatus: (id, data) =>
    api.put(`/admin/tickets/${id}/status`, data),

  // ============================================
  // ⚙️ تنظیمات
  // ============================================
  getSettings: () => api.get("/admin/settings"),
  updateSettings: (settings) => api.put("/admin/settings", { settings }),
  getFeatureFlags: () => api.get("/admin/settings/features"),
  updateFeatureFlags: (flags) => api.put("/admin/settings/features", { flags }),

  // ============================================
  // 🩺 سلامت سیستم
  // ============================================
  getSystemHealth: () => api.get("/admin/health"),
};

export default adminApi;
