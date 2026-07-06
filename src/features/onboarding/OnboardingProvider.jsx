/**
 * OnboardingProvider.jsx
 * Purpose: Manage user onboarding status (level, goal, initial settings)
 * Integration: Used in App.jsx for new users
 * Changes:
 * - L29: Replaced console.log with debug logger
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { storage } from "@utils/storage";
import debug from "../../utils/debug";

const OnboardingContext = createContext(null);

const ONBOARDING_STORAGE_KEY = "onboarding_completed";
const USER_LEVEL_KEY = "user_level";
const USER_GOAL_KEY = "user_learning_goal";

export function OnboardingProvider({ children }) {
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(() => {
    return storage.get(ONBOARDING_STORAGE_KEY) || false;
  });

  const [userLevel, setUserLevel] = useState(() => {
    return storage.get(USER_LEVEL_KEY) || null;
  });

  const [learningGoal, setLearningGoal] = useState(() => {
    return storage.get(USER_GOAL_KEY) || null;
  });

  const [onboardingStep, setOnboardingStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({
    level: null,
    goal: null,
    nativeLanguage: null,
    dailyGoal: 50,
    weeklyGoal: 300,
    interests: [],
    experience: "beginner",
  });

  /**
   * Save user level
   */
  const saveUserLevel = useCallback((level) => {
    setUserLevel(level);
    storage.set(USER_LEVEL_KEY, level);
    setOnboardingData((prev) => ({ ...prev, level }));
  }, []);

  /**
   * Save learning goal
   */
  const saveLearningGoal = useCallback((goal) => {
    setLearningGoal(goal);
    storage.set(USER_GOAL_KEY, goal);
    setOnboardingData((prev) => ({ ...prev, goal }));
  }, []);

  /**
   * Update onboarding data
   */
  const updateOnboardingData = useCallback((data) => {
    setOnboardingData((prev) => ({ ...prev, ...data }));
  }, []);

  /**
   * Go to next step
   */
  const nextStep = useCallback(() => {
    setOnboardingStep((prev) => prev + 1);
  }, []);

  /**
   * Go to previous step
   */
  const prevStep = useCallback(() => {
    setOnboardingStep((prev) => Math.max(0, prev - 1));
  }, []);

  /**
   * Complete onboarding
   */
  const completeOnboarding = useCallback(async () => {
    // Final save to localStorage
    storage.set(ONBOARDING_STORAGE_KEY, true);
    storage.set(USER_LEVEL_KEY, onboardingData.level);
    storage.set(USER_GOAL_KEY, onboardingData.goal);

    // Future: Send to server
    try {
      // await api.post('/user/onboarding', onboardingData);
      // ✅ L29: Replace console.log with debug
      debug.component("Onboarding", "Completed", onboardingData);
    } catch (error) {
      debug.error("Failed to save onboarding data:", error);
    }

    setIsOnboardingCompleted(true);
  }, [onboardingData]);

  /**
   * Reset onboarding (for testing)
   */
  const resetOnboarding = useCallback(() => {
    storage.remove(ONBOARDING_STORAGE_KEY);
    storage.remove(USER_LEVEL_KEY);
    storage.remove(USER_GOAL_KEY);
    setIsOnboardingCompleted(false);
    setUserLevel(null);
    setLearningGoal(null);
    setOnboardingStep(0);
    setOnboardingData({
      level: null,
      goal: null,
      nativeLanguage: null,
      dailyGoal: 50,
      weeklyGoal: 300,
      interests: [],
      experience: "beginner",
    });
  }, []);

  /**
   * Does onboarding need to be shown?
   */
  const needsOnboarding = !isOnboardingCompleted && !userLevel;

  /**
   * Get welcome message based on level
   */
  const getWelcomeMessage = useCallback(
    (language = "fa") => {
      const messages = {
        beginner: {
          fa: "به آکادمی آلمانی خوش آمدی! 🎉 از صفر شروع می‌کنیم و با هم تا تسلط پیش میریم.",
          en: "Welcome to German Academy! 🎉 We'll start from zero and progress to mastery together.",
        },
        elementary: {
          fa: "خوش برگشتی! 🌟 پایه‌های خوبی داری، حالا وقت پیشرفته‌تر شدنه.",
          en: "Welcome back! 🌟 You have a good foundation, now it's time to advance.",
        },
        intermediate: {
          fa: "عالی! 🚀 تو سطح متوسطی، آماده چالش‌های جدی‌تر؟",
          en: "Great! 🚀 You're at an intermediate level, ready for bigger challenges?",
        },
      };

      const experienceLevel = onboardingData.experience || "beginner";
      return (
        messages[experienceLevel]?.[language] || messages.beginner[language]
      );
    },
    [onboardingData.experience],
  );

  const value = {
    // State
    isOnboardingCompleted,
    onboardingStep,
    onboardingData,
    userLevel,
    learningGoal,
    needsOnboarding,

    // Actions
    updateOnboardingData,
    saveUserLevel,
    saveLearningGoal,
    nextStep,
    prevStep,
    completeOnboarding,
    resetOnboarding,
    getWelcomeMessage,

    // Helpers
    totalSteps: 4,
    isLastStep: onboardingStep === 3,
    isFirstStep: onboardingStep === 0,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}

export default OnboardingProvider;
