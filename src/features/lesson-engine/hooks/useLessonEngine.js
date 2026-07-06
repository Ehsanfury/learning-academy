/**
 * useLessonEngine.js
 * Path: src/features/lesson-engine/hooks/useLessonEngine.js
 * Description: Custom hook for lesson engine state management
 * Changes:
 * - FIXED C7: Score is now calculated based on correctness, not completion
 * - Added detailed answer tracking
 * - Improved state management
 */

import { useState, useCallback, useMemo } from "react";
import { LessonParser } from "../utils/LessonParser";

/**
 * Custom hook for managing lesson state and progression
 *
 * ✅ FIXED C7: Score is calculated based on correct answers, not just completion
 */
export const useLessonEngine = (initialLesson) => {
  // State
  const [lesson, setLesson] = useState(initialLesson);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [isPerfect, setIsPerfect] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Get all quiz questions from the lesson
  const quizQuestions = useMemo(() => {
    if (!lesson) return [];
    const sections = lesson.sections || [];
    const quizSection = sections.find((s) => s.type === "quiz");
    return quizSection?.questions || [];
  }, [lesson]);

  // Get total number of quiz questions
  const totalQuestions = useMemo(() => {
    return quizQuestions.length;
  }, [quizQuestions]);

  // Get number of answered questions
  const answeredCount = useMemo(() => {
    return Object.keys(answers).length;
  }, [answers]);

  // ✅ FIXED C7: Calculate score based on correctness
  const correctCount = useMemo(() => {
    let correct = 0;
    for (const question of quizQuestions) {
      const userAnswer = answers[question.id];
      if (userAnswer !== undefined && userAnswer !== null) {
        // Check if answer is correct
        if (question.correct !== undefined) {
          if (userAnswer === question.correct) {
            correct++;
          }
        }
      }
    }
    return correct;
  }, [quizQuestions, answers]);

  // Calculate score based on correct answers
  const calculatedScore = useMemo(() => {
    if (totalQuestions === 0) return 100;
    return Math.round((correctCount / totalQuestions) * 100);
  }, [correctCount, totalQuestions]);

  // Check if all questions are answered
  const allAnswered = useMemo(() => {
    return answeredCount === totalQuestions && totalQuestions > 0;
  }, [answeredCount, totalQuestions]);

  // Check if score is perfect
  const calculatedIsPerfect = useMemo(() => {
    return calculatedScore === 100 && totalQuestions > 0;
  }, [calculatedScore, totalQuestions]);

  // Get sections for navigation
  const sections = useMemo(() => {
    if (!lesson) return [];
    return lesson.sections || [];
  }, [lesson]);

  const currentSection = useMemo(() => {
    return sections[currentSectionIndex] || null;
  }, [sections, currentSectionIndex]);

  // Get total sections
  const totalSections = useMemo(() => {
    return sections.length;
  }, [sections]);

  // Navigation functions
  const goToNextSection = useCallback(() => {
    if (currentSectionIndex < totalSections - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      return true;
    }
    return false;
  }, [currentSectionIndex, totalSections]);

  const goToPreviousSection = useCallback(() => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      return true;
    }
    return false;
  }, [currentSectionIndex]);

  const goToSection = useCallback(
    (index) => {
      if (index >= 0 && index < totalSections) {
        setCurrentSectionIndex(index);
        return true;
      }
      return false;
    },
    [totalSections],
  );

  // Answer handling
  const handleAnswer = useCallback((questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  }, []);

  // ✅ FIXED C7: Calculate final score based on correctness
  const calculateFinalScore = useCallback(() => {
    if (totalQuestions === 0) {
      return {
        score: 100,
        isPerfect: true,
        correctCount: 0,
        totalQuestions: 0,
      };
    }

    let correct = 0;
    for (const question of quizQuestions) {
      const userAnswer = answers[question.id];
      if (userAnswer !== undefined && userAnswer !== null) {
        if (question.correct !== undefined && userAnswer === question.correct) {
          correct++;
        }
      }
    }

    const finalScore = Math.round((correct / totalQuestions) * 100);
    const finalIsPerfect = finalScore === 100 && totalQuestions > 0;

    return {
      score: finalScore,
      isPerfect: finalIsPerfect,
      correctCount: correct,
      totalQuestions: totalQuestions,
    };
  }, [quizQuestions, answers, totalQuestions]);

  // Complete the lesson
  const completeLesson = useCallback(() => {
    const result = calculateFinalScore();
    setScore(result.score);
    setIsPerfect(result.isPerfect);
    setIsCompleted(true);
    setShowResults(true);
    return result;
  }, [calculateFinalScore]);

  // Reset the lesson
  const resetLesson = useCallback(() => {
    setAnswers({});
    setCurrentSectionIndex(0);
    setIsCompleted(false);
    setScore(0);
    setIsPerfect(false);
    setShowResults(false);
  }, []);

  // Check if section is a quiz section
  const isQuizSection = useCallback((section) => {
    return section?.type === "quiz";
  }, []);

  // Get progress percentage
  const progressPercentage = useMemo(() => {
    if (totalQuestions === 0) return 100;
    return Math.round((answeredCount / totalQuestions) * 100);
  }, [answeredCount, totalQuestions]);

  // Get detailed answer results for display
  const answerResults = useMemo(() => {
    return quizQuestions.map((question) => ({
      questionId: question.id,
      question: question.question,
      userAnswer: answers[question.id],
      correctAnswer: question.correct,
      isCorrect:
        answers[question.id] !== undefined &&
        answers[question.id] === question.correct,
      isAnswered:
        answers[question.id] !== undefined && answers[question.id] !== null,
    }));
  }, [quizQuestions, answers]);

  // Get summary statistics
  const summary = useMemo(() => {
    const correct = correctCount;
    const incorrect = answeredCount - correct;
    const unanswered = totalQuestions - answeredCount;

    return {
      totalQuestions,
      answeredCount,
      correctCount: correct,
      incorrectCount: incorrect,
      unansweredCount: unanswered,
      score: calculatedScore,
      isPerfect: calculatedIsPerfect,
      allAnswered,
    };
  }, [
    totalQuestions,
    answeredCount,
    correctCount,
    calculatedScore,
    calculatedIsPerfect,
    allAnswered,
  ]);

  return {
    // State
    lesson,
    setLesson,
    currentSection,
    currentSectionIndex,
    answers,
    isCompleted,
    score,
    isPerfect,
    showResults,
    totalSections,
    totalQuestions,
    answeredCount,
    correctCount,
    calculatedScore,
    calculatedIsPerfect,
    allAnswered,
    progressPercentage,
    answerResults,
    summary,

    // Actions
    goToNextSection,
    goToPreviousSection,
    goToSection,
    handleAnswer,
    completeLesson,
    resetLesson,
    isQuizSection,
    calculateFinalScore,

    // Utilities
    getSection: (index) => sections[index] || null,
    getSectionIndex: (sectionId) =>
      sections.findIndex((s) => s.id === sectionId),
  };
};

export default useLessonEngine;
