/**
 * ExerciseResult.jsx
 * Path: src/components/exercise/ExerciseResult.jsx
 * Description: Exercise result display component
 */

import React from "react";
import { motion } from "framer-motion";
import { useLanguageContext } from "@context/LanguageContext";
import {
  Trophy,
  Star,
  Award,
  CheckCircle,
  XCircle,
  TrendingUp,
  Target,
  Sparkles,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

const ExerciseResult = ({
  score,
  passed,
  correctCount,
  totalQuestions,
  xpEarned,
  results,
  onRetry,
  onContinue,
}) => {
  const { language } = useLanguageContext();

  const getGrade = (score) => {
    if (score >= 90)
      return { label: "A+", color: "text-green-500", emoji: "🌟" };
    if (score >= 80)
      return { label: "A", color: "text-green-400", emoji: "⭐" };
    if (score >= 70) return { label: "B", color: "text-blue-500", emoji: "👍" };
    if (score >= 60)
      return { label: "C", color: "text-yellow-500", emoji: "📖" };
    return { label: "D", color: "text-red-500", emoji: "💪" };
  };

  const grade = getGrade(score);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto p-6 bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center"
        >
          {passed ? (
            <Trophy className="w-10 h-10 text-white" />
          ) : (
            <Target className="w-10 h-10 text-white" />
          )}
        </motion.div>

        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {passed
            ? language === "fa"
              ? "🎉 عالی! تمرین کامل شد!"
              : "🎉 Great! Exercise completed!"
            : language === "fa"
              ? "💪 خوب بود! ادامه بده!"
              : "💪 Good effort! Keep going!"}
        </h2>

        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          {language === "fa"
            ? `${correctCount} از ${totalQuestions} پاسخ صحیح`
            : `${correctCount} out of ${totalQuestions} correct`}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
          <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
            {score}%
          </p>
          <p className="text-xs text-neutral-500">
            {language === "fa" ? "امتیاز" : "Score"}
          </p>
        </div>

        <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
          <p className="text-3xl font-bold text-green-500">{correctCount}</p>
          <p className="text-xs text-neutral-500">
            {language === "fa" ? "صحیح" : "Correct"}
          </p>
        </div>

        <div className="text-center p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
          <p className="text-3xl font-bold text-red-500">
            {totalQuestions - correctCount}
          </p>
          <p className="text-xs text-neutral-500">
            {language === "fa" ? "غلط" : "Wrong"}
          </p>
        </div>

        <div className="text-center p-4 bg-amber-50 dark:bg-amber-950 rounded-xl border border-amber-200 dark:border-amber-800">
          <p className="text-3xl font-bold text-amber-500">+{xpEarned}</p>
          <p className="text-xs text-amber-600 dark:text-amber-400">XP</p>
        </div>
      </div>

      {/* Grade */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2">
          <span className="text-4xl">{grade.emoji}</span>
          <span className={`text-4xl font-bold ${grade.color}`}>
            {grade.label}
          </span>
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {language === "fa" ? "سطح عملکرد" : "Performance Level"}
        </p>
      </div>

      {/* Results Detail */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
          {language === "fa" ? "📊 جزئیات پاسخ‌ها" : "📊 Answer Details"}
        </h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {results?.map((result, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 p-2 rounded-lg ${
                result.isCorrect
                  ? "bg-green-50 dark:bg-green-950"
                  : "bg-red-50 dark:bg-red-950"
              }`}
            >
              {result.isCorrect ? (
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              )}
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {language === "fa" ? `سوال ${idx + 1}` : `Question ${idx + 1}`}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-auto">
                {result.isCorrect
                  ? language === "fa"
                    ? "✅ صحیح"
                    : "✅ Correct"
                  : language === "fa"
                    ? "❌ غلط"
                    : "❌ Wrong"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          {language === "fa" ? "تمرین مجدد" : "Try Again"}
        </button>
        <button
          onClick={onContinue}
          className="px-6 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 transition flex items-center gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          {language === "fa" ? "ادامه" : "Continue"}
        </button>
      </div>
    </motion.div>
  );
};

export default ExerciseResult;
