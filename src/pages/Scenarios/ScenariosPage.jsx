/**
 * ScenariosPage.jsx
 * Path: src/pages/Scenarios/ScenariosPage.jsx
 * Description: Interactive scenarios page
 * Version: 4.0 - Fixed multi-language rendering
 * Changes:
 * - ✅ Fixed: Objects are not valid as React child
 * - ✅ Using getLocalizedText for all translations
 * - ✅ Complete rewrite with proper localization
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@context/AuthContext";
import { useLanguageContext } from "@context/LanguageContext";
import { getLocalizedText } from "../../utils/i18n";
import api from "@services/api";
import debug from "../../utils/debug";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  Clock,
  Star,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  MessageSquare,
  Volume2,
  Award,
  X,
  Users,
  Sparkles,
  Target,
} from "lucide-react";
import toast from "react-hot-toast";
import Card from "@components/ui/Card";
import Button from "@components/ui/Button";
import Badge from "@components/ui/Badge";
import Skeleton from "@components/ui/Skeleton";

// ============================================
// 📊 Mock Data (با ساختار چندزبانه)
// ============================================

const MOCK_SCENARIOS = [
  {
    id: "scenario-1",
    title: {
      fa: "سفارش غذا در رستوران",
      en: "Ordering Food at a Restaurant",
      de: "Essen im Restaurant bestellen",
    },
    description: {
      fa: "تمرین مکالمه در رستوران آلمانی",
      en: "Practice conversation in a German restaurant",
      de: "Gespräch im deutschen Restaurant üben",
    },
    level: "A1",
    icon: "🍽️",
    xpReward: 50,
    estimatedMinutes: 10,
    completed: false,
    steps: [
      {
        id: "step-1",
        text: {
          fa: "به رستوران خوش آمدید! گارسون به شما سلام می‌کند.",
          en: "Welcome to the restaurant! The waiter greets you.",
          de: "Willkommen im Restaurant! Der Kellner begrüßt Sie.",
        },
        prompt: {
          fa: "چگونه به گارسون سلام می‌کنید؟",
          en: "How do you greet the waiter?",
          de: "Wie begrüßen Sie den Kellner?",
        },
        question: "چگونه به گارسون سلام می‌کنید؟",
        options: ["Hallo!", "Guten Tag!", "Tschüss!", "Danke!"],
        correct: "Guten Tag!",
      },
      {
        id: "step-2",
        text: {
          fa: "گارسون منو را به شما می‌دهد.",
          en: "The waiter gives you the menu.",
          de: "Der Kellner gibt Ihnen die Speisekarte.",
        },
        prompt: {
          fa: "چه چیزی سفارش می‌دهید؟",
          en: "What do you order?",
          de: "Was bestellen Sie?",
        },
        question: "چه چیزی سفارش می‌دهید؟",
        options: [
          "Ein Wasser, bitte.",
          "Ich möchte essen.",
          "Die Rechnung, bitte.",
          "Tschüss!",
        ],
        correct: "Ein Wasser, bitte.",
      },
    ],
  },
  {
    id: "scenario-2",
    title: {
      fa: "خرید از فروشگاه",
      en: "Shopping at a Store",
      de: "Einkaufen im Geschäft",
    },
    description: {
      fa: "تمرین خرید و پرسیدن قیمت",
      en: "Practice shopping and asking for prices",
      de: "Einkaufen und nach Preisen fragen üben",
    },
    level: "A1",
    icon: "🛍️",
    xpReward: 50,
    estimatedMinutes: 10,
    completed: false,
    steps: [
      {
        id: "step-1",
        text: {
          fa: "به فروشگاه خوش آمدید! فروشنده به شما سلام می‌کند.",
          en: "Welcome to the store! The shop assistant greets you.",
          de: "Willkommen im Geschäft! Der Verkäufer begrüßt Sie.",
        },
        prompt: {
          fa: "چه چیزی می‌خواهید بخرید؟",
          en: "What do you want to buy?",
          de: "Was möchten Sie kaufen?",
        },
        question: "چه چیزی می‌خواهید بخرید؟",
        options: ["Ein Buch", "Ein Tisch", "Eine Lampe", "Ein Auto"],
        correct: "Ein Buch",
      },
    ],
  },
  {
    id: "scenario-3",
    title: {
      fa: "پرسیدن مسیر",
      en: "Asking for Directions",
      de: "Nach dem Weg fragen",
    },
    description: {
      fa: "تمرین پرسیدن مسیر در شهر",
      en: "Practice asking for directions in the city",
      de: "Nach dem Weg in der Stadt fragen üben",
    },
    level: "A1",
    icon: "🗺️",
    xpReward: 55,
    estimatedMinutes: 10,
    completed: false,
    steps: [
      {
        id: "step-1",
        text: {
          fa: "در خیابان هستید و راه را گم کرده‌اید.",
          en: "You are on the street and lost.",
          de: "Sie sind auf der Straße und haben sich verlaufen.",
        },
        prompt: {
          fa: "از یک رهگذر می‌پرسید: ...",
          en: "You ask a passerby: ...",
          de: "Sie fragen einen Passanten: ...",
        },
        question: "چگونه راه را می‌پرسید؟",
        options: [
          "Entschuldigung, wo ist der Bahnhof?",
          "Hallo!",
          "Tschüss!",
          "Danke!",
        ],
        correct: "Entschuldigung, wo ist der Bahnhof?",
      },
    ],
  },
];

// ============================================
// 📊 Skeleton Component
// ============================================

const ScenariosSkeleton = () => (
  <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
    <div>
      <Skeleton variant="title" className="w-48" />
      <Skeleton variant="subtitle" className="w-64 mt-1" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="h-[160px]">
          <div className="flex items-start gap-4">
            <Skeleton variant="avatar" className="w-12 h-12" />
            <div className="flex-1">
              <Skeleton variant="title" className="w-3/4" />
              <Skeleton variant="text" className="w-full mt-2" />
              <div className="flex gap-3 mt-2">
                <Skeleton variant="text" className="w-16" />
                <Skeleton variant="text" className="w-16" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

// ============================================
// 📊 ScenariosPage Component
// ============================================

const ScenariosPage = () => {
  const { user } = useAuth();
  const { language } = useLanguageContext();

  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [filter, setFilter] = useState("all");
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/scenarios");
      let scenariosData = response?.data?.data || response?.data || [];

      if (!Array.isArray(scenariosData) || scenariosData.length === 0) {
        setScenarios(MOCK_SCENARIOS);
        setUseMockData(true);
      } else {
        setScenarios(scenariosData);
        setUseMockData(false);
      }
    } catch (error) {
      debug.error("Error loading scenarios:", error);
      setScenarios(MOCK_SCENARIOS);
      setUseMockData(true);
      if (error.response?.status !== 404) {
        setError(error.message || "خطا در بارگذاری سناریوها");
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 🎯 Localization Helpers
  // ============================================

  const getTitle = (item) => {
    if (!item) return "";
    return getLocalizedText(item.title, language, "بدون عنوان");
  };

  const getDescription = (item) => {
    if (!item) return "";
    return getLocalizedText(item.description, language, "");
  };

  const getStepText = (step) => {
    if (!step) return "";
    return getLocalizedText(step.text, language, "");
  };

  const getStepPrompt = (step) => {
    if (!step) return "";
    return getLocalizedText(step.prompt, language, "");
  };

  // ============================================
  // 🎯 Scenario Actions
  // ============================================

  const openScenario = (scenario) => {
    setSelectedScenario(scenario);
    setCurrentStep(0);
    setShowResults(false);
    setAnswers({});
    setResults(null);
    setCompleted(false);
    setXpGained(0);
    setIsActive(true);
  };

  const closeScenario = () => {
    setSelectedScenario(null);
    setIsActive(false);
  };

  const nextStep = () => {
    if (
      selectedScenario?.steps &&
      currentStep < selectedScenario.steps.length - 1
    ) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAnswer = (stepId, value) => {
    setAnswers({ ...answers, [stepId]: value });
  };

  const submitScenario = () => {
    if (!selectedScenario?.steps) return;

    let correctCount = 0;
    const totalQuestions = selectedScenario.steps.filter(
      (s) => s.question,
    ).length;

    selectedScenario.steps.forEach((step) => {
      if (step.question) {
        const userAnswer = answers[step.id];
        if (userAnswer === step.correct) {
          correctCount++;
        }
      }
    });

    const score =
      totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 100;
    const passed = score >= 70;
    const earnedXP = passed
      ? selectedScenario.xpReward || 50
      : Math.round((selectedScenario.xpReward || 50) * (score / 100));

    setResults({
      correctCount,
      totalQuestions,
      score,
      passed,
      earnedXP,
    });
    setXpGained(earnedXP);
    setCompleted(passed);

    if (passed) {
      toast.success(`🎉 سناریو کامل شد! +${earnedXP} XP`);
    } else {
      toast(`💪 امتیاز: ${score}% - دوباره تلاش کنید!`);
    }
  };

  const retryScenario = () => {
    setAnswers({});
    setResults(null);
    setCompleted(false);
    setCurrentStep(0);
    setShowResults(false);
  };

  // ============================================
  // 🛠️ Helper Functions
  // ============================================

  const getLevelColor = (level) => {
    const colors = {
      A1: "bg-green-500",
      A2: "bg-blue-500",
      B1: "bg-amber-500",
      B2: "bg-orange-500",
      C1: "bg-red-500",
      C2: "bg-purple-500",
    };
    return colors[level] || "bg-neutral-500";
  };

  const filteredScenarios =
    filter === "all" ? scenarios : scenarios.filter((s) => s.level === filter);

  const levels = ["all", ...new Set(scenarios.map((s) => s.level))];

  // ============================================
  // 🖼️ Render
  // ============================================

  if (loading) {
    return <ScenariosSkeleton />;
  }

  if (error && scenarios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="w-16 h-16 text-danger-500" />
        <p className="text-neutral-500 dark:text-neutral-400">{error}</p>
        <Button variant="primary" onClick={loadScenarios} icon={RefreshCw}>
          {language === "fa" ? "تلاش مجدد" : "Retry"}
        </Button>
      </div>
    );
  }

  // ============================================
  // 🎭 Active Scenario View
  // ============================================

  if (isActive && selectedScenario) {
    const steps = selectedScenario.steps || [];
    const currentStepData = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;

    // Show Results
    if (showResults) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={closeScenario}
            icon={ChevronLeft}
            className="mb-6"
          >
            {language === "fa" ? "بازگشت به سناریوها" : "Back to Scenarios"}
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="elevated" padding="lg">
              <div className="text-center">
                <div
                  className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    results?.passed
                      ? "bg-green-100 dark:bg-green-900"
                      : "bg-amber-100 dark:bg-amber-900"
                  }`}
                >
                  {results?.passed ? (
                    <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                  ) : (
                    <Target className="w-10 h-10 text-amber-600 dark:text-amber-400" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {results?.passed
                    ? language === "fa"
                      ? "🎉 عالی!"
                      : "🎉 Great!"
                    : language === "fa"
                      ? "💪 ادامه بده!"
                      : "💪 Keep going!"}
                </h3>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <Card variant="bordered" padding="md">
                    <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                      {results?.score}%
                    </p>
                    <p className="text-xs text-neutral-500">
                      {language === "fa" ? "امتیاز" : "Score"}
                    </p>
                  </Card>
                  <Card variant="bordered" padding="md">
                    <p className="text-2xl font-bold text-green-500">
                      {results?.correctCount}/{results?.totalQuestions}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {language === "fa" ? "صحیح" : "Correct"}
                    </p>
                  </Card>
                  <Card
                    variant="bordered"
                    padding="md"
                    className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800"
                  >
                    <p className="text-2xl font-bold text-amber-500">
                      +{results?.earnedXP}
                    </p>
                    <p className="text-xs text-neutral-500">XP</p>
                  </Card>
                </div>
                <div className="flex flex-wrap gap-3 justify-center mt-6">
                  {!results?.passed && (
                    <Button variant="primary" onClick={retryScenario}>
                      {language === "fa" ? "تلاش مجدد" : "Retry"}
                    </Button>
                  )}
                  <Button variant="secondary" onClick={closeScenario}>
                    {language === "fa" ? "بازگشت" : "Back"}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      );
    }

    // Show Step
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={closeScenario}
          icon={ChevronLeft}
          className="mb-6"
        >
          {language === "fa" ? "بازگشت به سناریوها" : "Back to Scenarios"}
        </Button>

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {selectedScenario.icon || "🎭"}
                </span>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {getTitle(selectedScenario)}
                  </h2>
                  <p className="text-xs text-neutral-500">
                    {language === "fa" ? "مرحله" : "Step"} {currentStep + 1}/
                    {steps.length}
                  </p>
                </div>
              </div>
              <Badge variant="primary">{selectedScenario.level}</Badge>
            </div>

            <div className="space-y-4">
              {/* ✅ FIXED: Using getStepText() which returns string */}
              {currentStepData?.text && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-lg text-neutral-800 dark:text-neutral-200 leading-relaxed">
                    {getStepText(currentStepData)}
                  </p>
                </div>
              )}

              {/* ✅ FIXED: Using getStepPrompt() which returns string */}
              {currentStepData?.prompt && (
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {getStepPrompt(currentStepData)}
                  </p>
                </div>
              )}

              {currentStepData?.question && (
                <div className="mt-4">
                  <p className="font-medium text-neutral-900 dark:text-neutral-100 mb-3">
                    {getStepPrompt(currentStepData)}
                  </p>
                  <div className="space-y-2">
                    {currentStepData.options.map((option, idx) => (
                      <label
                        key={idx}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                          answers[currentStepData.id] === option
                            ? "bg-primary-100 dark:bg-primary-900 border-primary-500"
                            : "hover:bg-white dark:hover:bg-neutral-900"
                        } border-2 border-transparent`}
                      >
                        <input
                          type="radio"
                          name={currentStepData.id}
                          value={option}
                          checked={answers[currentStepData.id] === option}
                          onChange={(e) =>
                            handleAnswer(currentStepData.id, e.target.value)
                          }
                          className="w-4 h-4 text-primary-500"
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <Button
                variant="secondary"
                onClick={previousStep}
                disabled={currentStep === 0}
                icon={ChevronLeft}
              >
                {language === "fa" ? "قبلی" : "Previous"}
              </Button>

              <Button
                variant="primary"
                onClick={isLastStep ? submitScenario : nextStep}
                icon={isLastStep ? null : ChevronRight}
                iconPosition={isLastStep ? undefined : "right"}
              >
                {isLastStep
                  ? language === "fa"
                    ? "ارسال"
                    : "Submit"
                  : language === "fa"
                    ? "بعدی"
                    : "Next"}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ============================================
  // 📋 Main Scenarios List
  // ============================================

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary-500" />
          {language === "fa"
            ? "🎭 سناریوهای تعاملی"
            : "🎭 Interactive Scenarios"}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          {language === "fa"
            ? `${scenarios.length} سناریو برای تمرین مکالمه در موقعیت‌های واقعی`
            : `${scenarios.length} scenarios for practicing conversation in real situations`}
          {useMockData && (
            <span className="text-xs text-amber-500 mr-2">
              (داده‌های نمونه)
            </span>
          )}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {levels.map((level) => (
          <Button
            key={level}
            variant={filter === level ? "primary" : "secondary"}
            size="sm"
            onClick={() => setFilter(level)}
          >
            {level === "all" ? (language === "fa" ? "همه" : "All") : level}
          </Button>
        ))}
      </div>

      {filteredScenarios.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <MessageSquare className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">
            {language === "fa"
              ? "هیچ سناریویی در این سطح وجود ندارد"
              : "No scenarios in this level"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScenarios.map((scenario, index) => {
            const isLocked = scenario.locked || false;
            const isCompleted = scenario.completed || false;

            return (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  variant="bordered"
                  padding="md"
                  hover={!isLocked}
                  className={isLocked ? "opacity-60 cursor-not-allowed" : ""}
                  onClick={() => {
                    if (!isLocked) {
                      openScenario(scenario);
                    }
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg ${getLevelColor(scenario.level)} flex items-center justify-center flex-shrink-0 text-white text-xl`}
                    >
                      {scenario.icon || "🎭"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {getTitle(scenario)}
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                        {getDescription(scenario)}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {scenario.estimatedMinutes || 10} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          {scenario.xpReward || 50} XP
                        </span>
                        <Badge variant="primary" size="xs">
                          {scenario.level || "A1"}
                        </Badge>
                        {isCompleted && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Stats Summary */}
      {scenarios.length > 0 && (
        <div className="mt-8 grid grid-cols-3 gap-4">
          <Card variant="bordered" padding="md" className="text-center">
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {scenarios.filter((s) => s.completed).length}/{scenarios.length}
            </p>
            <p className="text-xs text-neutral-500">
              {language === "fa" ? "تکمیل شده" : "Completed"}
            </p>
          </Card>
          <Card variant="bordered" padding="md" className="text-center">
            <p className="text-2xl font-bold text-amber-500">
              {scenarios.reduce((sum, s) => sum + (s.xpReward || 0), 0)}
            </p>
            <p className="text-xs text-neutral-500">XP</p>
          </Card>
          <Card variant="bordered" padding="md" className="text-center">
            <p className="text-2xl font-bold text-primary-500">
              {scenarios.filter((s) => !s.completed).length}
            </p>
            <p className="text-xs text-neutral-500">
              {language === "fa" ? "باقی‌مانده" : "Remaining"}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ScenariosPage;
