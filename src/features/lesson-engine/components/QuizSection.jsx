/**
 * QuizSection.jsx
 * Path: src/features/lesson-engine/components/QuizSection.jsx
 * Description: Quiz section component with proper grading
 * Changes:
 * - FIXED C7: Shows correct/incorrect feedback
 * - FIXED C8: Consistent question type naming using constants
 */

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Check, X, ChevronRight, ChevronLeft } from "lucide-react";
import {
  QUESTION_TYPES,
  normalizeQuestionType,
  getQuestionTypeDisplayName,
} from "../constants/questionTypes";

/**
 * QuizSection Component
 * Displays quiz questions with proper grading
 */
const QuizSection = ({
  section,
  answers = {},
  onAnswer,
  onComplete,
  isCompleted = false,
  showResults = false,
  language = "fa",
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const questions = section?.questions || [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];

  // Calculate score based on correctness
  const results = useMemo(() => {
    let correct = 0;
    let answered = 0;

    for (const question of questions) {
      const userAnswer = answers[question.id];
      if (userAnswer !== undefined && userAnswer !== null) {
        answered++;
        // ✅ FIXED C7: Check correctness
        const isCorrect = userAnswer === question.correct;
        if (isCorrect) correct++;
      }
    }

    return {
      correct,
      answered,
      total: questions.length,
      score:
        questions.length > 0
          ? Math.round((correct / questions.length) * 100)
          : 100,
    };
  }, [questions, answers]);

  const handleAnswerSelect = (questionId, value) => {
    if (isCompleted) return;

    const newAnswers = { ...selectedAnswers, [questionId]: value };
    setSelectedAnswers(newAnswers);
    onAnswer?.(questionId, value);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    for (const [questionId, answer] of Object.entries(selectedAnswers)) {
      onAnswer?.(questionId, answer);
    }
    onComplete?.();
  };

  // ✅ FIXED C8: Use normalized type with constants
  const getNormalizedType = (type) => {
    return normalizeQuestionType(type);
  };

  // Render different question types
  const renderQuestion = (question, isCompleted, showResults) => {
    const normalizedType = getNormalizedType(question.type);
    const userAnswer = answers[question.id];
    const isCorrect =
      userAnswer !== undefined && userAnswer === question.correct;

    switch (normalizedType) {
      case QUESTION_TYPES.MULTIPLE_CHOICE:
        return renderMultipleChoice(
          question,
          isCompleted,
          showResults,
          userAnswer,
          isCorrect,
        );
      case QUESTION_TYPES.FILL_IN_BLANK:
        return renderFillBlank(
          question,
          isCompleted,
          showResults,
          userAnswer,
          isCorrect,
        );
      case QUESTION_TYPES.TRUE_FALSE:
        return renderTrueFalse(
          question,
          isCompleted,
          showResults,
          userAnswer,
          isCorrect,
        );
      default:
        return renderDefaultQuestion(
          question,
          isCompleted,
          showResults,
          userAnswer,
          isCorrect,
        );
    }
  };

  const renderMultipleChoice = (
    question,
    isCompleted,
    showResults,
    userAnswer,
    isCorrect,
  ) => {
    const options = question.options || [];
    const getLanguageText = (obj) => {
      if (!obj) return "";
      if (typeof obj === "string") return obj;
      return obj[language] || obj.en || "";
    };

    return (
      <div className="space-y-4">
        <p className="text-lg font-medium text-gray-900 dark:text-white">
          {getLanguageText(question.question)}
        </p>
        <div className="space-y-2">
          {options.map((option, index) => {
            const isSelected = userAnswer === index;
            const isCorrectAnswer = index === question.correct;
            let className =
              "w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 ";

            if (showResults) {
              if (isCorrectAnswer) {
                className +=
                  "border-green-500 bg-green-50 dark:bg-green-900/20";
              } else if (isSelected && !isCorrectAnswer) {
                className += "border-red-500 bg-red-50 dark:bg-red-900/20";
              } else {
                className += "border-gray-200 dark:border-gray-700";
              }
            } else if (isSelected) {
              className +=
                "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20";
            } else {
              className +=
                "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700";
            }

            return (
              <button
                key={index}
                onClick={() =>
                  !isCompleted && handleAnswerSelect(question.id, index)
                }
                disabled={isCompleted}
                className={className}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showResults && isCorrectAnswer && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                  {showResults && isSelected && !isCorrectAnswer && (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {showResults && question.explanation && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {getLanguageText(question.explanation)}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderFillBlank = (
    question,
    isCompleted,
    showResults,
    userAnswer,
    isCorrect,
  ) => {
    const getLanguageText = (obj) => {
      if (!obj) return "";
      if (typeof obj === "string") return obj;
      return obj[language] || obj.en || "";
    };

    return (
      <div className="space-y-4">
        <p className="text-lg font-medium text-gray-900 dark:text-white">
          {getLanguageText(question.question)}
        </p>
        <div className="flex flex-wrap gap-2">
          {question.options?.map((option, index) => (
            <button
              key={index}
              onClick={() =>
                !isCompleted && handleAnswerSelect(question.id, option)
              }
              disabled={isCompleted}
              className={`
                px-4 py-2 rounded-lg border transition-all duration-200
                ${userAnswer === option ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-gray-200 dark:border-gray-700 hover:border-indigo-300"}
                ${showResults && option === question.correct ? "border-green-500 bg-green-50 dark:bg-green-900/20" : ""}
                ${showResults && userAnswer === option && option !== question.correct ? "border-red-500 bg-red-50 dark:bg-red-900/20" : ""}
              `}
            >
              {option}
              {showResults && option === question.correct && (
                <Check className="w-4 h-4 inline ml-2 text-green-500" />
              )}
              {showResults &&
                userAnswer === option &&
                option !== question.correct && (
                  <X className="w-4 h-4 inline ml-2 text-red-500" />
                )}
            </button>
          ))}
        </div>
        {showResults && question.explanation && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {getLanguageText(question.explanation)}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderTrueFalse = (
    question,
    isCompleted,
    showResults,
    userAnswer,
    isCorrect,
  ) => {
    const getLanguageText = (obj) => {
      if (!obj) return "";
      if (typeof obj === "string") return obj;
      return obj[language] || obj.en || "";
    };

    const options = [
      { value: true, label: language === "fa" ? "صحیح" : "True" },
      { value: false, label: language === "fa" ? "غلط" : "False" },
    ];

    return (
      <div className="space-y-4">
        <p className="text-lg font-medium text-gray-900 dark:text-white">
          {getLanguageText(question.question)}
        </p>
        <div className="flex gap-4">
          {options.map((option) => {
            const isSelected = userAnswer === option.value;
            const isCorrectAnswer = option.value === question.correct;
            let className =
              "flex-1 px-6 py-3 rounded-lg border text-center transition-all duration-200 ";

            if (showResults) {
              if (isCorrectAnswer) {
                className +=
                  "border-green-500 bg-green-50 dark:bg-green-900/20";
              } else if (isSelected && !isCorrectAnswer) {
                className += "border-red-500 bg-red-50 dark:bg-red-900/20";
              } else {
                className += "border-gray-200 dark:border-gray-700";
              }
            } else if (isSelected) {
              className +=
                "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20";
            } else {
              className +=
                "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700";
            }

            return (
              <button
                key={option.value}
                onClick={() =>
                  !isCompleted && handleAnswerSelect(question.id, option.value)
                }
                disabled={isCompleted}
                className={className}
              >
                <span className="text-lg font-medium">{option.label}</span>
                {showResults && isCorrectAnswer && (
                  <Check className="w-5 h-5 inline ml-2 text-green-500" />
                )}
                {showResults && isSelected && !isCorrectAnswer && (
                  <X className="w-5 h-5 inline ml-2 text-red-500" />
                )}
              </button>
            );
          })}
        </div>
        {showResults && question.explanation && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {getLanguageText(question.explanation)}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderDefaultQuestion = (
    question,
    isCompleted,
    showResults,
    userAnswer,
    isCorrect,
  ) => {
    const getLanguageText = (obj) => {
      if (!obj) return "";
      if (typeof obj === "string") return obj;
      return obj[language] || obj.en || "";
    };

    return (
      <div className="space-y-4">
        <p className="text-lg font-medium text-gray-900 dark:text-white">
          {getLanguageText(question.question)}
        </p>
        {question.options && (
          <div className="flex flex-wrap gap-2">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() =>
                  !isCompleted && handleAnswerSelect(question.id, option)
                }
                disabled={isCompleted}
                className={`
                  px-4 py-2 rounded-lg border transition-all duration-200
                  ${userAnswer === option ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" : "border-gray-200 dark:border-gray-700 hover:border-indigo-300"}
                  ${showResults && option === question.correct ? "border-green-500 bg-green-50 dark:bg-green-900/20" : ""}
                  ${showResults && userAnswer === option && option !== question.correct ? "border-red-500 bg-red-50 dark:bg-red-900/20" : ""}
                `}
              >
                {option}
              </button>
            ))}
          </div>
        )}
        {showResults && question.explanation && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {getLanguageText(question.explanation)}
            </p>
          </div>
        )}
      </div>
    );
  };

  if (totalQuestions === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No questions available for this quiz.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </span>
        {showResults && (
          <span
            className={`text-sm font-medium ${results.score >= 70 ? "text-green-600" : "text-red-600"}`}
          >
            Score: {results.score}%
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 transition-all duration-300"
          style={{
            width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
          }}
        />
      </div>

      {/* Question Type Badge */}
      {currentQuestion && (
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
            {getQuestionTypeDisplayName(currentQuestion.type, language)}
          </span>
        </div>
      )}

      {/* Question */}
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        {renderQuestion(currentQuestion, isCompleted, showResults)}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </button>

        <div className="flex items-center gap-2">
          {!isCompleted && currentQuestionIndex === totalQuestions - 1 && (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Submit Quiz
            </button>
          )}
          {!isCompleted && currentQuestionIndex < totalQuestions - 1 && (
            <button
              onClick={handleNext}
              className="flex items-center px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          )}
          {isCompleted && showResults && (
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Retry Quiz
            </button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Quiz Results
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {results.score}%
              </div>
              <div className="text-sm text-gray-500">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {results.correct}
              </div>
              <div className="text-sm text-gray-500">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {results.answered - results.correct}
              </div>
              <div className="text-sm text-gray-500">Incorrect</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {results.total - results.answered}
              </div>
              <div className="text-sm text-gray-500">Unanswered</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default QuizSection;
