import { useState, useCallback } from "react";
import lessonApi from "@services/lessonApi";

function useLesson(lessonId) {
  const [lesson, setLesson] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});

  const fetchLesson = useCallback(async () => {
    if (!lessonId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await lessonApi.getLesson(lessonId);
      setLesson(data);
      setCurrentSection(0);
      setAnswers({});
    } catch (err) {
      setError(err.message || "خطا در دریافت درس");
    } finally {
      setIsLoading(false);
    }
  }, [lessonId]);

  const goToSection = useCallback(
    (index) => {
      if (lesson && index >= 0 && index < lesson.sections.length) {
        setCurrentSection(index);
      }
    },
    [lesson],
  );

  const nextSection = useCallback(() => {
    setCurrentSection((prev) => {
      if (lesson && prev < lesson.sections.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  }, [lesson]);

  const previousSection = useCallback(() => {
    setCurrentSection((prev) => Math.max(0, prev - 1));
  }, []);

  const saveAnswer = useCallback((questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  }, []);

  const getSectionProgress = useCallback(() => {
    if (!lesson) return 0;
    return Math.round(((currentSection + 1) / lesson.sections.length) * 100);
  }, [lesson, currentSection]);

  const isLastSection = lesson
    ? currentSection === lesson.sections.length - 1
    : false;

  const isFirstSection = currentSection === 0;

  return {
    lesson,
    currentSection,
    isLoading,
    error,
    answers,
    fetchLesson,
    goToSection,
    nextSection,
    previousSection,
    saveAnswer,
    getSectionProgress,
    isLastSection,
    isFirstSection,
    totalSections: lesson?.sections.length || 0,
  };
}

export default useLesson;
