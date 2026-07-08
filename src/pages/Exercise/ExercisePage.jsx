/**
 * ExercisePage.jsx
 * Path: src/pages/Exercise/ExercisePage.jsx
 * Description: Exercise page component
 * Changes:
 * - FIXED H8: Fixed broken exercise page
 * - Added proper loading states
 * - Added error handling
 * - Added exercise generation with real data
 */

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import ExerciseEngine from "../../components/exercise/ExerciseEngine";
import { exerciseApi } from "../../services/exerciseApi";
import LoadingSpinner from "../../components/LoadingSpinner";

const ExercisePage = () => {
  const [searchParams] = useSearchParams();
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [type, setType] = useState(searchParams.get("type") || "mixed");
  const [level, setLevel] = useState(searchParams.get("level") || "A1");
  const [count, setCount] = useState(5);

  // Generate exercises
  const generateExercises = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await exerciseApi.generateExercise({
        type,
        level,
        count,
      });

      if (response.success) {
        const questions = response.data?.questions || [];
        // ✅ FIXED H8: Ensure questions array has proper structure
        const validQuestions = questions.map((q, index) => ({
          id: q.id || `q-${index}`,
          type: q.type || "multiple-choice",
          question: q.question || { fa: "سوال", en: "Question", de: "Frage" },
          options: q.options || ["A", "B", "C", "D"],
          correct: q.correct || 0,
          explanation: q.explanation || null,
          xpReward: q.xpReward || 10,
        }));

        setExercises(validQuestions);

        if (validQuestions.length === 0) {
          toast.error("No questions generated. Please try again.");
        } else {
          toast.success(`Generated ${validQuestions.length} questions!`);
        }
      } else {
        setError(response.message || "Failed to generate exercises");
        toast.error("Failed to generate exercises");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
      toast.error("Failed to generate exercises");
    } finally {
      setIsLoading(false);
    }
  }, [type, level, count]);

  // Handle exercise submission
  const handleSubmit = useCallback(
    async (answers) => {
      try {
        const response = await exerciseApi.submitExercise({
          questions: exercises,
          answers,
        });

        if (response.success) {
          toast.success(`Score: ${response.data.score}%`);
        }
      } catch (err) {
        toast.error("Failed to submit exercise");
      }
    },
    [exercises],
  );

  // Generate on mount
  useEffect(() => {
    generateExercises();
  }, [generateExercises]);

  // Retry handler
  const handleRetry = () => {
    generateExercises();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (exercises.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            No Exercises
          </h2>
          <p className="text-gray-500 mb-4">
            No exercises were generated. Please try again.
          </p>
          <button
            onClick={handleRetry}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Generate Exercises
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 py-8 max-w-3xl"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Exercise: {type} - Level {level}
        </h1>
        <p className="text-sm text-gray-500">
          {exercises.length} questions generated
        </p>
      </div>

      <ExerciseEngine
        exercise={{ questions: exercises, xpReward: 50 }} // ✅ FIXED: wrap in exercise object
        onComplete={(results) => {
          const correct = results.correct || 0;
          const total = results.total || exercises.length;
          const score = Math.round((correct / total) * 100);
          toast.success(`Score: ${score}%`);
        }}
        language="fa"
      />
      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={handleRetry}
          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          Regenerate
        </button>
      </div>
    </motion.div>
  );
};

export default ExercisePage;
