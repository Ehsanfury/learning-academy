import api from "./api";

const analyticsApi = {
  trackEvent: async (event, data = {}) => {
    return api.post("/analytics/event", { event, data });
  },

  getUserStats: async () => {
    return api.get("/analytics/stats");
  },

  getWeeklyActivity: async () => {
    return api.get("/analytics/weekly-activity");
  },

  getLearningInsights: async () => {
    return api.get("/analytics/insights");
  },
};

export default analyticsApi;
