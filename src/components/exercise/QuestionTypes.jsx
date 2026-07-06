/**
 * QuestionTypes.jsx
 * Path: src/components/exercise/QuestionTypes.jsx
 * Description: Question type components for exercise engine
 * Changes:
 * - FIXED C8: Consistent question type naming using constants
 * - Integrated with centralized question types
 */

import React, { useState } from "react";
import { Check, X } from "lucide-react";
import {
  QUESTION_TYPES,
  normalizeQuestionType,
} from "../../features/lesson-engine/constants/questionTypes";

/**
 * Multiple Choice Question
 */
export const MultipleChoiceQuestion = ({
  question,
  userAnswer,
  onAnswer,
  isCompleted = false,
  showResults = false,
  language = "fa",
}) => {
  const getLanguageText = (obj) => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[language] || obj.en || "";
  };

  const options = question.options || [];

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
              className += "border-green-500 bg-green-50 dark:bg-green-900/20";
            } else if (isSelected && !isCorrectAnswer) {
              className += "border-red-500 bg-red-50 dark:bg-red-900/20";
            } else {
              className += "border-gray-200 dark:border-gray-700";
            }
          } else if (isSelected) {
            className += "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20";
          } else {
            className +=
              "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700";
          }

          return (
            <button
              key={index}
              onClick={() => !isCompleted && onAnswer?.(index)}
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

/**
 * Fill in the Blank Question
 */
export const FillBlankQuestion = ({
  question,
  userAnswer,
  onAnswer,
  isCompleted = false,
  showResults = false,
  language = "fa",
}) => {
  const getLanguageText = (obj) => {
    if (!obj) return "";
    if (typeof obj === "string") return obj;
    return obj[language] || obj.en || "";
  };

  const options = question.options || [];

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-gray-900 dark:text-white">
        {getLanguageText(question.question)}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => !isCompleted && onAnswer?.(option)}
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

/**
 * Question renderer that selects the correct component based on type
 */
export const QuestionRenderer = ({
  question,
  userAnswer,
  onAnswer,
  isCompleted = false,
  showResults = false,
  language = "fa",
}) => {
  const normalizedType = normalizeQuestionType(question.type);

  switch (normalizedType) {
    case QUESTION_TYPES.MULTIPLE_CHOICE:
      return (
        <MultipleChoiceQuestion
          question={question}
          userAnswer={userAnswer}
          onAnswer={onAnswer}
          isCompleted={isCompleted}
          showResults={showResults}
          language={language}
        />
      );
    case QUESTION_TYPES.FILL_IN_BLANK:
      return (
        <FillBlankQuestion
          question={question}
          userAnswer={userAnswer}
          onAnswer={onAnswer}
          isCompleted={isCompleted}
          showResults={showResults}
          language={language}
        />
      );
    default:
      return (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-yellow-700 dark:text-yellow-300">
            Question type "{question.type}" is not yet supported.
          </p>
        </div>
      );
  }
};

export default {
  MultipleChoiceQuestion,
  FillBlankQuestion,
  QuestionRenderer,
};
