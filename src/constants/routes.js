const ROUTES = {
  // Public routes
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",

  // Protected routes
  DASHBOARD: "/dashboard",
  LEARN: "/learn",
  LESSON: "/lesson/:id",
  PRACTICE: "/practice",
  STORIES: "/stories",
  SCENARIOS: "/scenarios",
  DICTIONARY: "/dictionary",
  AI_TUTOR: "/ai-tutor",
  MENTORS: "/mentors",
  JOURNEY: "/journey",

  // User routes
  PROFILE: "/profile",
  SETTINGS: "/settings",

  // Fallback
  NOT_FOUND: "*",
};

export default ROUTES;
