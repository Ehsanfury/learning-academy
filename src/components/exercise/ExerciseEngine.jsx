/**
 * ExerciseEngine.jsx
 * Path: src/components/exercise/ExerciseEngine.jsx
 * Description: Exercise engine component
 * Version: 2.2 - Fixed missing ArrowRight import
 */

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { QuestionRenderer } from "./QuestionTypes";
import { normalizeQuestionType } from "../../features/lesson-engine/constants/questionTypes";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight, // ✅ FIXED: Added missing import
  ArrowLeft, // ✅ FIXED: Added missing import
} from "lucide-react";
import Button from "@components/ui/Button";
import Card from "@components/ui/Card";
import Badge from "@components/ui/Badge";

const ExerciseEngine = ({
  questions = [],
  onSubmit,
  onAnswer,
  onComplete,
  isCompleted = false,
  language = "fa",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  // Calculate results
  const results = useMemo(() => {
    let correct = 0;
    let answered = 0;

    for (const question of questions) {
      const userAnswer = answers[question.id];
      if (userAnswer !== undefined && userAnswer !== null) {
        answered++;
        if (userAnswer === question.correct) {
          correct++;
        }
      }
    }

    return {
      correct,
      answered,
      total: questions.length,
      score:
        questions.length > 0
          ? Math.round((correct / questions.length) * 100)
          : 0,
    };
  }, [questions, answers]);

  const handleAnswer = (questionId, value) => {
    if (isCompleted || showResults) return;
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    onAnswer?.(questionId, value);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
    onSubmit?.(answers);
    onComplete?.(results);
  };

  const handleRetry = () => {
    setShowResults(false);
    setAnswers({});
    setCurrentIndex(0);
  };

  const getLocalized = (text) => {
    if (!text) return "";
    if (typeof text === "string") return text;
    return text[language] || text.fa || text.en || "";
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
        <p>هیچ سوالی برای نمایش وجود ندارد.</p>
      </div>
    );
  }

  // Show Results
  if (showResults) {
    const passed = results.score >= 70;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <Card variant="elevated" padding="lg">
          <div className="text-center">
            <div
              className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                passed
                  ? "bg-green-100 dark:bg-green-900"
                  : "bg-amber-100 dark:bg-amber-900"
              }`}
            >
              {passed ? (
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              ) : (
                <Target className="w-10 h-10 text-amber-600 dark:text-amber-400" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              {passed
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
                  {results.score}%
                </p>
                <p className="text-xs text-neutral-500">
                  {language === "fa" ? "امتیاز" : "Score"}
                </p>
              </Card>
              <Card variant="bordered" padding="md">
                <p className="text-2xl font-bold text-green-500">
                  {results.correct}/{results.total}
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
                  {Math.round(results.score * 0.5)}
                </p>
                <p className="text-xs text-neutral-500">XP</p>
              </Card>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-6">
              <Button variant="primary" onClick={handleRetry}>
                {language === "fa" ? "تلاش مجدد" : "Retry"}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Show Question
  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-neutral-500">
          {language === "fa" ? "سوال" : "Question"} {currentIndex + 1} از{" "}
          {totalQuestions}
        </span>
        <Badge variant="secondary" size="sm">
          {Object.keys(answers).length} / {totalQuestions}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="p-6 bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700">
        <QuestionRenderer
          question={currentQuestion}
          userAnswer={answers[currentQuestion?.id]}
          onAnswer={(value) => handleAnswer(currentQuestion?.id, value)}
          isCompleted={isCompleted || showResults}
          showResults={showResults}
          language={language}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex items-center px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === "fa" ? "قبلی" : "Previous"}
        </button>

        <div className="flex items-center gap-2">
          {currentIndex === totalQuestions - 1 ? (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < totalQuestions}
              icon={CheckCircle}
            >
              {language === "fa" ? "ارسال پاسخ‌ها" : "Submit"}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleNext}
              iconPosition="right"
              icon={ArrowRight}
            >
              {language === "fa" ? "بعدی" : "Next"}
            </Button>
          )}
        </div>
      </div>

      {/* Answer Status */}
      {Object.keys(answers).length < totalQuestions && (
        <p className="text-xs text-neutral-400 text-center">
          {language === "fa"
            ? `${totalQuestions - Object.keys(answers).length} سوال بدون پاسخ`
            : `${totalQuestions - Object.keys(answers).length} unanswered questions`}
        </p>
      )}
    </div>
  );
};

export default ExerciseEngine;
