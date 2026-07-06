/**
 * LessonParser.js
 * Path: src/features/lesson-engine/utils/LessonParser.js
 * Description: Utility for parsing lesson data
 * Changes:
 * - FIXED C7: Added methods for answer validation
 * - FIXED C8: Consistent question type naming
 */

export const LessonParser = {
  /**
   * Get all questions from a lesson
   */
  getQuestions: (lesson) => {
    if (!lesson) return [];
    const sections = lesson.sections || [];
    const quizSection = sections.find((s) => s.type === "quiz");
    return quizSection?.questions || [];
  },

  /**
   * Get total number of questions in a lesson
   */
  getTotalQuestions: (lesson) => {
    return LessonParser.getQuestions(lesson).length;
  },

  /**
   * Check if a question is answered
   */
  isQuestionAnswered: (questionId, answers) => {
    return answers[questionId] !== undefined && answers[questionId] !== null;
  },

  /**
   * Check if answer is correct
   */
  isAnswerCorrect: (question, userAnswer) => {
    if (!question || userAnswer === undefined || userAnswer === null)
      return false;
    return userAnswer === question.correct;
  },

  /**
   * Calculate score based on answers
   */
  calculateScore: (questions, answers) => {
    if (!questions || questions.length === 0) {
      return {
        score: 100,
        correctCount: 0,
        totalQuestions: 0,
        isPerfect: true,
      };
    }

    let correctCount = 0;
    for (const question of questions) {
      const userAnswer = answers[question.id];
      if (userAnswer !== undefined && userAnswer !== null) {
        if (question.correct !== undefined && userAnswer === question.correct) {
          correctCount++;
        }
      }
    }

    const totalQuestions = questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const isPerfect = score === 100 && totalQuestions > 0;

    return {
      score,
      correctCount,
      totalQuestions,
      isPerfect,
    };
  },

  /**
   * Get answer results for display
   */
  getAnswerResults: (questions, answers) => {
    if (!questions) return [];

    return questions.map((question) => {
      const userAnswer = answers[question.id];
      const isAnswered = userAnswer !== undefined && userAnswer !== null;
      const isCorrect = isAnswered && userAnswer === question.correct;

      return {
        questionId: question.id,
        question: question.question,
        userAnswer,
        correctAnswer: question.correct,
        isAnswered,
        isCorrect,
      };
    });
  },

  /**
   * Normalize question type (handle legacy naming)
   */
  normalizeQuestionType: (type) => {
    const typeMap = {
      multiple_choice: "multiple-choice",
      fill_in: "fill-in-blank",
      "fill-blank": "fill-in-blank",
    };
    return typeMap[type] || type;
  },

  /**
   * Get section by type
   */
  getSectionByType: (lesson, type) => {
    if (!lesson) return null;
    const sections = lesson.sections || [];
    return sections.find((s) => s.type === type) || null;
  },

  /**
   * Get sections by types
   */
  getSectionsByTypes: (lesson, types) => {
    if (!lesson) return [];
    const sections = lesson.sections || [];
    return sections.filter((s) => types.includes(s.type));
  },

  /**
   * Get vocabulary from lesson
   */
  getVocabulary: (lesson) => {
    if (!lesson) return [];
    const sections = lesson.sections || [];
    const vocabSection = sections.find((s) => s.type === "vocabulary");
    return vocabSection?.words || [];
  },

  /**
   * Get grammar from lesson
   */
  getGrammar: (lesson) => {
    if (!lesson) return null;
    const sections = lesson.sections || [];
    return sections.find((s) => s.type === "grammar") || null;
  },
};

export default LessonParser;
