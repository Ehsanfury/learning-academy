/**
 * apiEndpoints.js
 * Path: src/constants/apiEndpoints.js
 * Description: Centralized API endpoints
 * Changes:
 * - L18: Made API_ENDPOINTS used throughout the app
 */

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REFRESH_TOKEN: "/api/auth/refresh-token",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: "/api/auth/reset-password",
    VERIFY: "/api/auth/verify",
    ME: "/api/auth/me",
  },

  // Users
  USERS: {
    PROFILE: "/api/users/profile",
    STATS: "/api/users/stats",
    STREAK: "/api/users/streak",
    ACTIVITY: "/api/users/activity",
    SETTINGS: "/api/users/settings",
    LEADERBOARD: "/api/users/leaderboard",
    SEARCH: "/api/users/search",
  },

  // Lessons
  LESSONS: {
    ALL: "/api/lessons",
    BY_LEVEL: "/api/lessons/level",
    NEXT: "/api/lessons/next",
    STATS: "/api/lessons/stats",
    RECOMMENDED: "/api/lessons/recommended",
    DETAIL: (id) => `/api/lessons/${id}`,
    PROGRESS: (id) => `/api/lessons/${id}/progress`,
    COMPLETE: (id) => `/api/lessons/${id}/complete`,
    ANSWER: (id) => `/api/lessons/${id}/answer`,
    LOCK: (id) => `/api/lessons/${id}/lock`,
  },

  // Progress
  PROGRESS: {
    ALL: "/api/progress",
    STATS: "/api/progress/stats",
    IN_PROGRESS: "/api/progress/in-progress",
    LAST_COMPLETED: "/api/progress/last-completed",
    COMPLETED: "/api/progress/completed",
    LEVEL_DISTRIBUTION: "/api/progress/level-distribution",
    DAILY_STATS: "/api/progress/daily-stats",
    LESSON: (lessonId) => `/api/progress/lesson/${lessonId}`,
  },

  // AI
  AI: {
    CHAT: "/api/ai/chat",
    GRAMMAR_CORRECT: "/api/ai/grammar/correct",
    TRANSLATE: "/api/ai/translate",
    GRAMMAR_EXPLAIN: "/api/ai/grammar/explain",
    EXERCISE_GENERATE: "/api/ai/exercise/generate",
    SCENARIO_START: "/api/ai/scenario/start",
    SCENARIO_CONTINUE: "/api/ai/scenario/continue",
    HISTORY: "/api/ai/history",
    SESSIONS: "/api/ai/sessions",
  },

  // Vocabulary
  VOCABULARY: {
    WORDS: "/api/vocabulary/words",
    CATEGORIES: "/api/vocabulary/categories",
    SAVED: "/api/vocabulary/saved",
    SEARCH: "/api/vocabulary/search",
    REVIEW: (wordId) => `/api/vocabulary/review/${wordId}`,
  },

  // Achievements
  ACHIEVEMENTS: {
    ALL: "/api/achievements",
    MY: "/api/achievements/my",
    UNVIEWED: "/api/achievements/unviewed",
    STATS: "/api/achievements/stats",
    VIEW: (id) => `/api/achievements/${id}/view`,
  },

  // Mentors
  MENTORS: {
    ALL: "/api/mentors",
    PROFILE: "/api/mentors/profile",
    STATS: "/api/mentors/stats",
    REGISTER: "/api/mentors/register",
    MY_SESSIONS: "/api/mentors/my-sessions",
    DETAIL: (id) => `/api/mentors/${id}`,
    BOOK: (id) => `/api/mentors/${id}/book`,
    SESSION_STATUS: (id) => `/api/mentors/sessions/${id}/status`,
    SESSION_COMPLETE: (id) => `/api/mentors/sessions/${id}/complete`,
  },

  // Stories
  STORIES: {
    ALL: "/api/stories",
    DETAIL: (id) => `/api/stories/${id}`,
    START: (id) => `/api/stories/${id}/start`,
    PROGRESS: (id) => `/api/stories/${id}/progress`,
  },

  // Scenarios
  SCENARIOS: {
    ALL: "/api/scenarios",
    DETAIL: (id) => `/api/scenarios/${id}`,
    START: "/api/scenarios/start",
    CONTINUE: "/api/scenarios/continue",
  },

  // Levels
  LEVELS: {
    ALL: "/api/levels",
    DETAIL: (levelId) => `/api/levels/${levelId}`,
    PROGRESS: (levelId) => `/api/levels/${levelId}/progress`,
  },

  // Exercises
  EXERCISES: {
    GENERATE: "/api/exercises/generate",
    SUBMIT: "/api/exercises/submit",
    TYPES: "/api/exercises/types",
    LEVELS: "/api/exercises/levels",
    HISTORY: "/api/exercises/history",
  },
};

export default API_ENDPOINTS;
