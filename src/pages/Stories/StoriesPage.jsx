/**
 * StoriesPage.jsx
 * Path: src/pages/Stories/StoriesPage.jsx
 * Description: Interactive stories for language learning
 * Version: 4.1 - Fixed loading state name
 * Changes:
 * - ✅ FIXED: Changed setLoading to setIsLoading (consistent naming)
 * - ✅ FIXED: Added missing isLoading state
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
  BookText,
  Volume2,
  Award,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import Card from "@components/ui/Card";
import Button from "@components/ui/Button";
import Badge from "@components/ui/Badge";
import Skeleton from "@components/ui/Skeleton";

// ============================================
// 📊 StoriesSkeleton
// ============================================

const StoriesSkeleton = () => (
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
// 📚 StoriesPage
// ============================================

const StoriesPage = () => {
  const { user } = useAuth();
  const { language } = useLanguageContext();

  const [stories, setStories] = useState([]);
  // ✅ FIXED: Changed to isLoading for consistency
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState({});
  const [quizResults, setQuizResults] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    loadStories();
  }, []);

  // ============================================
  // 📥 Load Stories
  // ============================================

  const loadStories = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // ✅ Add delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 300));

      const response = await api.get("/stories");
      const data = response?.data?.data || [];

      setStories(data);
    } catch (error) {
      debug.error("Error loading stories:", error);
      setError(error.message || "خطا در بارگذاری داستان‌ها");

      // ✅ Show user-friendly message for 429
      if (error.response?.status === 429) {
        toast.error(
          "درخواست‌های زیادی ارسال شده است. لطفاً چند ثانیه صبر کنید.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // 🎯 Localization Helpers
  // ============================================

  const getTitle = (story) => {
    if (!story) return "";
    return getLocalizedText(story.title, language, "داستان");
  };

  const getDescription = (story) => {
    if (!story) return "";
    return getLocalizedText(story.description, language, "");
  };

  const getQuestionText = (question) => {
    if (!question) return "";
    return getLocalizedText(question, language, "");
  };

  // ============================================
  // 📖 Story Actions
  // ============================================

  const openStory = (story) => {
    setSelectedStory(story);
    setCurrentParagraph(0);
    setShowQuiz(false);
    setAnswers({});
    setQuizResults(null);
    setCompleted(false);
    setXpGained(0);
    setIsReading(true);
  };

  const closeStory = () => {
    setSelectedStory(null);
    setIsReading(false);
  };

  const nextParagraph = () => {
    if (
      selectedStory?.paragraphs &&
      currentParagraph < selectedStory.paragraphs.length - 1
    ) {
      setCurrentParagraph(currentParagraph + 1);
    } else {
      setShowQuiz(true);
    }
  };

  const previousParagraph = () => {
    if (currentParagraph > 0) {
      setCurrentParagraph(currentParagraph - 1);
    }
  };

  const handleAnswer = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const submitQuiz = () => {
    if (!selectedStory?.quiz) return;

    let correctCount = 0;
    const totalQuestions = selectedStory.quiz.length;

    selectedStory.quiz.forEach((q) => {
      if (answers[q.id] === q.correct) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= 70;
    const earnedXP = passed
      ? selectedStory.xpReward || 50
      : Math.round((selectedStory.xpReward || 50) * (score / 100));

    setQuizResults({
      correctCount,
      totalQuestions,
      score,
      passed,
      earnedXP,
    });
    setXpGained(earnedXP);
    setCompleted(passed);

    if (passed) {
      toast.success(`🎉 داستان کامل شد! +${earnedXP} XP`);
    } else {
      toast(`💪 امتیاز: ${score}% - دوباره تلاش کنید!`);
    }
  };

  const retryQuiz = () => {
    setAnswers({});
    setQuizResults(null);
    setCompleted(false);
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

  const getStatusBadge = (status) => {
    const badges = {
      completed: {
        variant: "success",
        label: { fa: "خوانده شده", en: "Read" },
      },
      in_progress: {
        variant: "warning",
        label: { fa: "در حال خواندن", en: "Reading" },
      },
      locked: { variant: "secondary", label: { fa: "قفل", en: "Locked" } },
    };
    return badges[status] || badges.locked;
  };

  const filteredStories =
    filter === "all" ? stories : stories.filter((s) => s.level === filter);

  const levels = ["all", ...new Set(stories.map((s) => s.level))];

  // ============================================
  // 🖼️ Render
  // ============================================

  if (isLoading) {
    return <StoriesSkeleton />;
  }

  if (error && stories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="w-16 h-16 text-danger-500" />
        <p className="text-neutral-500 dark:text-neutral-400">{error}</p>
        <Button variant="primary" onClick={loadStories} icon={RefreshCw}>
          {language === "fa" ? "تلاش مجدد" : "Retry"}
        </Button>
      </div>
    );
  }

  // ============================================
  // 📖 Reading View
  // ============================================

  if (isReading && selectedStory) {
    const paragraphs = selectedStory.paragraphs || [];
    const currentPara = paragraphs[currentParagraph];
    const isLastParagraph = currentParagraph === paragraphs.length - 1;

    // Show Quiz
    if (showQuiz) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={closeStory}
            icon={ChevronLeft}
            className="mb-6"
          >
            {language === "fa" ? "بازگشت به داستان‌ها" : "Back to Stories"}
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="elevated" padding="lg">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{selectedStory.icon || "📖"}</span>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                    {language === "fa" ? "📝 آزمون داستان" : "📝 Story Quiz"}
                  </h2>
                  <p className="text-sm text-neutral-500">
                    {getTitle(selectedStory)}
                  </p>
                </div>
              </div>

              {quizResults ? (
                <div className="text-center">
                  <div
                    className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      quizResults.passed
                        ? "bg-green-100 dark:bg-green-900"
                        : "bg-amber-100 dark:bg-amber-900"
                    }`}
                  >
                    {quizResults.passed ? (
                      <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                    ) : (
                      <Target className="w-10 h-10 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {quizResults.passed
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
                        {quizResults.score}%
                      </p>
                      <p className="text-xs text-neutral-500">
                        {language === "fa" ? "امتیاز" : "Score"}
                      </p>
                    </Card>
                    <Card variant="bordered" padding="md">
                      <p className="text-2xl font-bold text-green-500">
                        {quizResults.correctCount}/{quizResults.totalQuestions}
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
                        +{quizResults.earnedXP}
                      </p>
                      <p className="text-xs text-neutral-500">XP</p>
                    </Card>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center mt-6">
                    {!quizResults.passed && (
                      <Button variant="primary" onClick={retryQuiz}>
                        {language === "fa" ? "تلاش مجدد" : "Retry Quiz"}
                      </Button>
                    )}
                    <Button variant="secondary" onClick={closeStory}>
                      {language === "fa" ? "بازگشت" : "Back"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {selectedStory.quiz.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
                    >
                      <p className="font-medium text-neutral-900 dark:text-neutral-100 mb-3">
                        {idx + 1}. {getQuestionText(q.question)}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((option, oi) => (
                          <label
                            key={oi}
                            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition ${
                              answers[q.id] === option
                                ? "bg-primary-100 dark:bg-primary-900 border-primary-500"
                                : "hover:bg-white dark:hover:bg-neutral-900"
                            } border-2 border-transparent`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              value={option}
                              checked={answers[q.id] === option}
                              onChange={(e) =>
                                handleAnswer(q.id, e.target.value)
                              }
                              className="w-4 h-4 text-primary-500"
                            />
                            <span className="text-sm">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={submitQuiz}
                    fullWidth
                  >
                    {language === "fa" ? "ارسال پاسخ‌ها" : "Submit Answers"}
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      );
    }

    // Show Paragraph
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={closeStory}
          icon={ChevronLeft}
          className="mb-6"
        >
          {language === "fa" ? "بازگشت به داستان‌ها" : "Back to Stories"}
        </Button>

        <motion.div
          key={currentParagraph}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedStory.icon || "📖"}</span>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    {getTitle(selectedStory)}
                  </h2>
                  <p className="text-xs text-neutral-500">
                    {language === "fa" ? "بخش" : "Part"} {currentParagraph + 1}/
                    {paragraphs.length}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={Volume2}
                onClick={() => {
                  if (window.speechSynthesis) {
                    const utterance = new SpeechSynthesisUtterance(
                      currentPara?.de || currentPara?.text || "",
                    );
                    utterance.lang = "de-DE";
                    utterance.rate = 0.8;
                    window.speechSynthesis.speak(utterance);
                  }
                }}
              >
                {language === "fa" ? "گوش دادن" : "Listen"}
              </Button>
            </div>

            <div className="space-y-4">
              {currentPara?.de && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-lg text-neutral-800 dark:text-neutral-200 leading-relaxed">
                    {currentPara.de}
                  </p>
                </div>
              )}
              {currentPara?.fa && (
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {currentPara.fa}
                  </p>
                </div>
              )}
              {currentPara?.vocabulary && currentPara.vocabulary.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-neutral-500 mb-2">
                    📚 {language === "fa" ? "لغات جدید:" : "New Words:"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {currentPara.vocabulary.map((word, idx) => (
                      <Badge key={idx} variant="primary" size="sm">
                        {word.de} ({word.fa})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <Button
                variant="secondary"
                onClick={previousParagraph}
                disabled={currentParagraph === 0}
                icon={ChevronLeft}
              >
                {language === "fa" ? "قبلی" : "Previous"}
              </Button>

              <Button
                variant="primary"
                onClick={nextParagraph}
                icon={isLastParagraph ? null : ChevronRight}
                iconPosition={isLastParagraph ? undefined : "right"}
              >
                {isLastParagraph
                  ? language === "fa"
                    ? "شروع آزمون"
                    : "Start Quiz"
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
  // 📋 Main Stories List
  // ============================================

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary-500" />
          {language === "fa"
            ? "📚 داستان‌های تعاملی"
            : "📚 Interactive Stories"}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          {language === "fa"
            ? `${stories.length} داستان برای بهبود مهارت خواندن و شنیداری`
            : `${stories.length} stories to improve reading and listening skills`}
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

      {filteredStories.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <BookText className="w-16 h-16 text-neutral-300 dark:text-neutral-700 mx-auto mb-4" />
          <p className="text-neutral-500 dark:text-neutral-400">
            {language === "fa"
              ? "هیچ داستانی در این سطح وجود ندارد"
              : "No stories in this level"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStories.map((story, index) => {
            const status = story.status || "available";
            const statusBadge = getStatusBadge(status);
            const isLocked = status === "locked";

            return (
              <motion.div
                key={story.id}
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
                      openStory(story);
                    }
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg ${getLevelColor(story.level)} flex items-center justify-center flex-shrink-0 text-white text-xl`}
                    >
                      {story.icon || "📖"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {getTitle(story)}
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                        {getDescription(story)}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {story.estimatedMinutes || 10} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          {story.xpReward || 50} XP
                        </span>
                        <Badge variant="primary" size="xs">
                          {story.level || "A1"}
                        </Badge>
                        {story.completed && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <div className="mt-2">
                        <Badge variant={statusBadge.variant} size="xs">
                          {statusBadge.label[language]}
                        </Badge>
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
      {stories.length > 0 && (
        <div className="mt-8 grid grid-cols-3 gap-4">
          <Card variant="bordered" padding="md" className="text-center">
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {stories.filter((s) => s.completed).length}/{stories.length}
            </p>
            <p className="text-xs text-neutral-500">
              {language === "fa" ? "تکمیل شده" : "Completed"}
            </p>
          </Card>
          <Card variant="bordered" padding="md" className="text-center">
            <p className="text-2xl font-bold text-amber-500">
              {stories.reduce((sum, s) => sum + (s.xpReward || 0), 0)}
            </p>
            <p className="text-xs text-neutral-500">XP</p>
          </Card>
          <Card variant="bordered" padding="md" className="text-center">
            <p className="text-2xl font-bold text-primary-500">
              {stories.filter((s) => !s.completed).length}
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

export default StoriesPage;
