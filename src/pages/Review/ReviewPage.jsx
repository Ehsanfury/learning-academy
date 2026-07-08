/**
 * ReviewPage.jsx
 * Path: src/pages/Review/ReviewPage.jsx
 * Description: Spaced repetition review system
 * Changes:
 * - ✅ FIXED: Added missing imports (Loader2, AlertCircle, RefreshCw, CheckCircle, RotateCcw, XCircle)
 * - ✅ Cleaned up import list
 * - ✅ Added proper error handling
 */

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@context/AuthContext";
import { useLanguageContext } from "@context/LanguageContext";
import api from "@services/api";
import debug from "../../utils/debug";
import {
  Flame,
  Zap,
  Target,
  Loader2,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  RotateCcw,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

// ============================================
// 📊 Review Page
// ============================================

const ReviewPage = () => {
  const { user } = useAuth();
  const { language } = useLanguageContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    due: 0,
    mastered: 0,
    reviewed: 0,
    correct: 0,
  });
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    correct: 0,
    wrong: 0,
    streak: 0,
    bestStreak: 0,
  });

  // ============================================
  // 📥 Load Due Words
  // ============================================

  useEffect(() => {
    loadDueWords();
  }, []);

  const loadDueWords = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/review/due");
      const wordsData = response?.data?.data || response?.data || [];

      setWords(wordsData);
      setStats((prev) => ({
        ...prev,
        total: wordsData.length,
        due: wordsData.length,
      }));

      if (wordsData.length === 0) {
        toast.success(
          language === "fa"
            ? "🎉 همه لغات را مرور کرده‌اید!"
            : "🎉 All words reviewed!",
        );
      }
    } catch (error) {
      debug.error("Error loading due words:", error);
      setError(error.message || "خطا در بارگذاری لغات");
      toast.error("خطا در بارگذاری لغات");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 🎮 Review Actions
  // ============================================

  const handleKnow = async () => {
    const word = words[currentIndex];
    if (!word) return;

    try {
      await api.post(`/review/${word.id}/review`, { quality: 5 });

      setSessionStats((prev) => ({
        ...prev,
        correct: prev.correct + 1,
        streak: prev.streak + 1,
        bestStreak: Math.max(prev.bestStreak, prev.streak + 1),
      }));

      removeCurrentWord();
      toast.success("✅ لغت را می‌دانید!");
    } catch (error) {
      debug.error("Error reviewing word:", error);
      toast.error("خطا در ثبت مرور");
    }
  };

  const handleDontKnow = async () => {
    const word = words[currentIndex];
    if (!word) return;

    try {
      await api.post(`/review/${word.id}/review`, { quality: 1 });

      setSessionStats((prev) => ({
        ...prev,
        wrong: prev.wrong + 1,
        streak: 0,
      }));

      removeCurrentWord();
      toast.info("📖 لغت را مرور کنید");
    } catch (error) {
      debug.error("Error reviewing word:", error);
      toast.error("خطا در ثبت مرور");
    }
  };

  const removeCurrentWord = () => {
    setWords((prev) => prev.filter((_, i) => i !== currentIndex));
    setStats((prev) => ({
      ...prev,
      reviewed: prev.reviewed + 1,
    }));

    if (currentIndex >= words.length - 1) {
      setSessionComplete(true);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRetry = () => {
    setSessionComplete(false);
    setSessionStats({
      total: 0,
      correct: 0,
      wrong: 0,
      streak: 0,
      bestStreak: 0,
    });
    setCurrentIndex(0);
    setIsFlipped(false);
    loadDueWords();
  };

  // ============================================
  // 🖼️ Render
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto" />
          <p className="text-neutral-500 dark:text-neutral-400 mt-4">
            {language === "fa" ? "در حال بارگذاری لغات..." : "Loading words..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <p className="text-neutral-500 dark:text-neutral-400">{error}</p>
        <button
          onClick={loadDueWords}
          className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          {language === "fa" ? "تلاش مجدد" : "Retry"}
        </button>
      </div>
    );
  }

  if (words.length === 0 || sessionComplete) {
    const totalReviewed = stats.reviewed;
    const accuracy =
      totalReviewed > 0
        ? Math.round((sessionStats.correct / totalReviewed) * 100)
        : 0;

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl p-8 border border-neutral-200 dark:border-neutral-800 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>

          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            🎉 {language === "fa" ? "مرور کامل شد!" : "Review Complete!"}
          </h2>

          <p className="text-neutral-500 dark:text-neutral-400 mt-2">
            {language === "fa"
              ? `${stats.reviewed} لغت مرور شد`
              : `${stats.reviewed} words reviewed`}
          </p>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="text-2xl font-bold text-green-500">
                {sessionStats.correct}
              </p>
              <p className="text-xs text-neutral-500">
                {language === "fa" ? "صحیح" : "Correct"}
              </p>
            </div>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <p className="text-2xl font-bold text-red-500">
                {sessionStats.wrong}
              </p>
              <p className="text-xs text-neutral-500">
                {language === "fa" ? "غلط" : "Wrong"}
              </p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <p className="text-2xl font-bold text-amber-500">{accuracy}%</p>
              <p className="text-xs text-neutral-500">
                {language === "fa" ? "دقت" : "Accuracy"}
              </p>
            </div>
          </div>

          {sessionStats.bestStreak > 0 && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                🔥 {language === "fa" ? "بهترین استریک:" : "Best streak:"}{" "}
                {sessionStats.bestStreak}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3 justify-center mt-6">
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              {language === "fa" ? "مرور مجدد" : "Review Again"}
            </button>
            <button
              onClick={() => (window.location.href = "/learn")}
              className="px-6 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-200 transition"
            >
              {language === "fa" ? "بازگشت به درس‌ها" : "Back to Lessons"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentWord = words[currentIndex] || words[0];
  const progress = (stats.reviewed / (stats.reviewed + words.length)) * 100;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-primary-500" />
            {language === "fa" ? "🔄 مرور لغات" : "🔄 Word Review"}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">
            {language === "fa"
              ? `${words.length} لغت برای مرور`
              : `${words.length} words to review`}
          </p>
        </div>
        <div className="text-sm text-neutral-500">
          {stats.reviewed}/{stats.reviewed + words.length}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-6 text-sm">
        <div className="flex items-center gap-1 text-green-500">
          <CheckCircle className="w-4 h-4" />
          <span>{sessionStats.correct}</span>
        </div>
        <div className="flex items-center gap-1 text-red-500">
          <XCircle className="w-4 h-4" />
          <span>{sessionStats.wrong}</span>
        </div>
        <div className="flex items-center gap-1 text-amber-500">
          <Flame className="w-4 h-4" />
          <span>{sessionStats.streak}</span>
        </div>
      </div>

      {/* Flashcard */}
      <div className="mb-8">
        <div className="relative w-full max-w-md mx-auto">
          <div
            className="relative w-full transition-transform duration-500"
            style={{ perspective: "1000px", height: "340px" }}
          >
            <motion.div
              className="w-full h-full"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
              style={{ transformStyle: "preserve-3d", position: "relative" }}
            >
              {/* Front Side */}
              <div
                className="absolute inset-0 w-full h-full rounded-2xl shadow-xl"
                style={{
                  backfaceVisibility: "hidden",
                  backgroundColor: "#ffffff",
                  border: "2px solid #e5e7eb",
                }}
              >
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-xs text-white bg-green-500">
                      {currentWord.level || "A1"}
                    </span>
                  </div>
                  <div className="text-6xl mb-4">
                    {currentWord.emoji || "📚"}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {currentWord.de || currentWord.word}
                  </h3>
                  {currentWord.pronunciation && (
                    <p className="text-sm text-gray-400 mb-1">
                      /{currentWord.pronunciation}/
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-3">
                    👆 {isFlipped ? "برگشت" : "کلیک کنید تا معنی را ببینید"}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFlip();
                    }}
                    className="absolute bottom-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                  >
                    <RotateCcw className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Back Side */}
              <div
                className="absolute inset-0 w-full h-full rounded-2xl shadow-xl"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  backgroundColor: "#f8fafc",
                  border: "2px solid #e5e7eb",
                }}
              >
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <div className="mb-4">
                    <p className="text-xs text-gray-400 mb-1">🇩🇪 → 🌍</p>
                    <h3 className="text-2xl font-bold text-primary-600">
                      {currentWord.fa || currentWord.translation}
                    </h3>
                    {currentWord.en && (
                      <p className="text-sm text-gray-400 mt-1">
                        ({currentWord.en})
                      </p>
                    )}
                  </div>
                  {currentWord.example && (
                    <div className="w-full mt-2">
                      <p className="text-xs text-gray-400 mb-1">📝 مثال:</p>
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-800">
                          {currentWord.example}
                        </p>
                        {currentWord.exampleFa && (
                          <p className="text-xs text-gray-500 mt-1">
                            {currentWord.exampleFa}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-3">
                    👆 کلیک کنید تا برگردد
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFlip();
                    }}
                    className="absolute bottom-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                  >
                    <RotateCcw className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handleDontKnow}
          className="px-8 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition text-lg font-medium"
        >
          {language === "fa" ? "❌ نمی‌دانم" : "Don't Know"}
        </button>
        <button
          onClick={handleKnow}
          className="px-8 py-3 rounded-xl bg-green-500 text-white hover:bg-green-600 transition text-lg font-medium"
        >
          {language === "fa" ? "✅ می‌دانم" : "Know"}
        </button>
      </div>

      {/* Hint */}
      <p className="text-center text-xs text-neutral-400 mt-4">
        {language === "fa"
          ? "⌨️ از کلیدهای → و ← برای حرکت استفاده کنید"
          : "⌨️ Use → and ← keys to navigate"}
      </p>
    </div>
  );
};

export default ReviewPage;
