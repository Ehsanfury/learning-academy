/**
 * ExerciseEngine.jsx
 * Path: src/components/exercise/ExerciseEngine.jsx
 * Description: Exercise engine component for rendering and handling exercises
 * Changes:
 * - ✅ FIXED: Better question extraction from various data structures
 * - ✅ FIXED: Added language support
 * - ✅ FIXED: Handle empty questions gracefully
 * - ✅ FIXED: Support for both 'questions' and 'exercise' props
 * - ✅ FIXED: Added Target icon import
 */

import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Target,
} from "lucide-react";
import { cn } from "../../utils/helpers";
import { useLanguage } from "../../context/LanguageContext";

const ExerciseEngine = ({
  exercise,
  questions: propQuestions,
  onComplete,
  onNext,
  onPrevious,
  isFirst = false,
  isLast = false,
  className,
  language: propLanguage,
}) => {
  const { language: contextLanguage } = useLanguage();
  const language = propLanguage || contextLanguage;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  // ✅ FIXED: استخراج صحیح سوالات از ساختارهای مختلف
  const extractQuestions = (exerciseData) => {
    if (!exerciseData) return [];

    // 1. اگر خود exerciseData شامل questions باشد
    if (
      exerciseData.questions &&
      Array.isArray(exerciseData.questions) &&
      exerciseData.questions.length > 0
    ) {
      return exerciseData.questions;
    }

    // 2. اگر exerciseData.data شامل questions باشد
    if (
      exerciseData.data?.questions &&
      Array.isArray(exerciseData.data.questions)
    ) {
      return exerciseData.data.questions;
    }

    // 3. اگر exerciseData شامل quiz باشد
    if (exerciseData.quiz && Array.isArray(exerciseData.quiz)) {
      return exerciseData.quiz;
    }

    // 4. اگر exerciseData شامل items باشد
    if (exerciseData.items && Array.isArray(exerciseData.items)) {
      return exerciseData.items;
    }

    // 5. اگر exerciseData یک آرایه است
    if (Array.isArray(exerciseData)) {
      return exerciseData;
    }

    return [];
  };

  // ✅ Support both 'exercise' and 'questions' props
  const allQuestions = propQuestions || extractQuestions(exercise);

  // Reset state when questions change
  useEffect(() => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResults(false);
    setShowFeedback(false);
  }, [allQuestions]);

  if (!allQuestions || allQuestions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          {language === "fa"
            ? "هیچ سوالی برای این تمرین وجود ندارد"
            : "No questions available for this exercise"}
        </p>
      </div>
    );
  }

  const currentQuestion = allQuestions[currentQuestionIndex];
  const totalQuestions = allQuestions.length;

  const handleAnswer = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setShowFeedback(false);
    } else {
      // Calculate score
      let correct = 0;
      allQuestions.forEach((q) => {
        const userAnswer = answers[q.id];
        if (userAnswer !== undefined && userAnswer !== null) {
          if (q.type === "multiple_choice") {
            if (userAnswer === q.correct || userAnswer === q.correctIndex) {
              correct++;
            }
          } else if (q.type === "true_false") {
            if (userAnswer === q.answer) {
              correct++;
            }
          } else if (q.type === "fill_in" || q.type === "gap_fill") {
            if (
              userAnswer.toLowerCase().trim() === q.answer?.toLowerCase().trim()
            ) {
              correct++;
            }
          }
        }
      });

      const calculatedScore = Math.round((correct / totalQuestions) * 100);
      setScore(calculatedScore);
      setCorrectCount(correct);
      setShowResults(true);

      if (onComplete) {
        onComplete({
          score: calculatedScore,
          correct,
          total: totalQuestions,
          answers,
          earnedXP: exercise?.xpReward || Math.round(calculatedScore / 10),
        });
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setShowFeedback(false);
    }
  };

  const getQuestionText = (q) => {
    if (typeof q === "string") return q;
    if (q.question && typeof q.question === "object") {
      return (
        q.question[language] ||
        q.question.fa ||
        q.question.en ||
        JSON.stringify(q.question)
      );
    }
    if (q.question) return q.question;
    if (q.text) return q.text;
    if (q.prompt) return q.prompt;
    if (q.situation) return q.situation;
    if (q.questionText) return q.questionText;
    return JSON.stringify(q);
  };

  const getOptions = (q) => {
    if (q.options && Array.isArray(q.options)) return q.options;
    if (q.choices && Array.isArray(q.choices)) return q.choices;
    return [];
  };

  const getCorrectAnswer = (q) => {
    if (q.correct !== undefined) return q.correct;
    if (q.correctIndex !== undefined) return q.correctIndex;
    if (q.answer !== undefined) return q.answer;
    return 0;
  };

  const getQuestionType = (q) => {
    return q.type || "multiple_choice";
  };

  const renderQuestion = () => {
    if (showResults) {
      return (
        <div className="text-center py-8">
          <div className="mb-6">
            {score >= 70 ? (
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            )}
          </div>
          <h3 className="text-2xl font-bold mb-2">
            {score >= 70
              ? language === "fa"
                ? "🎉 عالی!"
                : "🎉 Excellent!"
              : language === "fa"
                ? "💪 ادامه بده!"
                : "Keep Practicing!"}
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {language === "fa"
              ? `شما ${correctCount} از ${totalQuestions} سوال را درست پاسخ دادید (${score}%)`
              : `You got ${correctCount} out of ${totalQuestions} correct (${score}%)`}
          </p>
          <div className="mt-4">
            <div className="w-full max-w-md mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-4">
              <div
                className={cn(
                  "h-4 rounded-full transition-all duration-500",
                  score >= 70 ? "bg-green-500" : "bg-yellow-500",
                )}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => onNext && onNext()}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {language === "fa" ? "ادامه" : "Continue"}
          </button>
        </div>
      );
    }

    const qType = getQuestionType(currentQuestion);
    const options = getOptions(currentQuestion);
    const correct = getCorrectAnswer(currentQuestion);
    const qText = getQuestionText(currentQuestion);

    return (
      <div className="space-y-6">
        {/* Progress */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {language === "fa"
              ? `سوال ${currentQuestionIndex + 1} از ${totalQuestions}`
              : `Question ${currentQuestionIndex + 1} of ${totalQuestions}`}
          </span>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {exercise?.xpReward || 10} XP
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
            }}
          />
        </div>

        {/* Question */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h4 className="text-lg font-medium mb-4">{qText}</h4>

          {qType === "multiple_choice" && (
            <div className="space-y-3">
              {options.map((option, index) => {
                const isSelected = answers[currentQuestion.id] === index;
                const isCorrect = showFeedback && index === correct;
                const isWrong = showFeedback && isSelected && index !== correct;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(currentQuestion.id, index)}
                    disabled={showFeedback}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-lg border-2 transition-all",
                      isSelected && !showFeedback
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-400",
                      isCorrect && showFeedback
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "",
                      isWrong && showFeedback
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                        : "",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                      {isCorrect && showFeedback && (
                        <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
                      )}
                      {isWrong && showFeedback && (
                        <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {qType === "true_false" && (
            <div className="flex gap-4">
              {["True", "False"].map((value) => {
                const isSelected = answers[currentQuestion.id] === value;
                return (
                  <button
                    key={value}
                    onClick={() => handleAnswer(currentQuestion.id, value)}
                    disabled={showFeedback}
                    className={cn(
                      "flex-1 px-6 py-3 rounded-lg border-2 transition-all",
                      isSelected && !showFeedback
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-400",
                      showFeedback &&
                        value === correct &&
                        "border-green-500 bg-green-50 dark:bg-green-900/20",
                      showFeedback &&
                        isSelected &&
                        value !== correct &&
                        "border-red-500 bg-red-50 dark:bg-red-900/20",
                    )}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          )}

          {qType === "fill_in" && (
            <div>
              <input
                type="text"
                value={answers[currentQuestion.id] || ""}
                onChange={(e) =>
                  handleAnswer(currentQuestion.id, e.target.value)
                }
                disabled={showFeedback}
                placeholder={
                  language === "fa"
                    ? "پاسخ خود را بنویسید..."
                    : "Type your answer..."
                }
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:outline-none dark:bg-gray-900"
              />
              {showFeedback && (
                <p
                  className={cn(
                    "mt-2 text-sm",
                    answers[currentQuestion.id]?.toLowerCase().trim() ===
                      correct?.toLowerCase().trim()
                      ? "text-green-600"
                      : "text-red-600",
                  )}
                >
                  {answers[currentQuestion.id]?.toLowerCase().trim() ===
                  correct?.toLowerCase().trim()
                    ? "✅ " + (language === "fa" ? "درست!" : "Correct!")
                    : `❌ ${language === "fa" ? "پاسخ صحیح" : "Correct answer"}: ${correct}`}
                </p>
              )}
            </div>
          )}

          {showFeedback && currentQuestion.explanation && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                💡 {currentQuestion.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={isFirst && currentQuestionIndex === 0}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === "fa" ? "قبلی" : "Previous"}
          </button>

          {currentQuestionIndex === totalQuestions - 1 ? (
            <button
              onClick={handleNext}
              disabled={Object.keys(answers).length < totalQuestions}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {language === "fa" ? "مشاهده نتایج" : "See Results"}
              <CheckCircle className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {language === "fa" ? "بعدی" : "Next"}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn("w-full max-w-4xl mx-auto p-4", className)}>
      {renderQuestion()}
    </div>
  );
};

export default ExerciseEngine;
