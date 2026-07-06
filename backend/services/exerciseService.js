/**
 * exerciseService.js
 * Path: backend/services/exerciseService.js
 * Description: Exercise service for managing exercises
 * Changes:
 * - ✅ FIXED: getExercisesByLesson now extracts exercises from sections
 * - ✅ FIXED: Properly handles all exercise types
 */

import { Op } from "sequelize";
import { Exercise, Lesson, User } from "../models/index.js";
import logger from "../config/logger.js";

class ExerciseService {
  /**
   * Get exercises by lesson ID
   */
  async getExercisesByLesson(lessonId, userId = null) {
    try {
      logger.info(`📚 Getting exercises for lesson: ${lessonId}`);

      const lesson = await Lesson.findByPk(lessonId);
      if (!lesson) {
        return { exercises: [], total: 0 };
      }

      // Extract exercises from sections
      const sections = lesson.sections || [];
      let exercises = [];

      sections.forEach((section) => {
        if (section.type === "exercises" && section.data) {
          const data = section.data;
          const exerciseTypes = [
            "vocabulary",
            "grammar",
            "reading",
            "listening",
            "writing",
            "mixed",
          ];

          exerciseTypes.forEach((type) => {
            if (data[type] && Array.isArray(data[type])) {
              data[type].forEach((exercise) => {
                exercises.push({
                  id:
                    exercise.id ||
                    `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                  type: type,
                  title: exercise.title || `${type} exercise`,
                  questions: exercise.questions || [],
                  difficulty: exercise.difficulty || 1,
                  xpReward: exercise.xpReward || 10,
                  lessonId: lessonId,
                });
              });
            }
          });
        }

        // Also check for quiz in review section
        if (section.type === "review" && section.quiz) {
          exercises.push({
            id: `review-${Date.now()}`,
            type: "review",
            title: "مرور درس",
            questions: section.quiz || [],
            difficulty: 1,
            xpReward: 15,
            lessonId: lessonId,
          });
        }
      });

      if (exercises.length > 0) {
        return { exercises, total: exercises.length, source: "lesson_sections" };
      }

      // Fallback: check Exercise table
      const dbExercises = await Exercise.findAll({
        where: { lessonId },
        order: [["createdAt", "ASC"]],
      });

      if (dbExercises.length > 0) {
        return {
          exercises: dbExercises.map((e) => e.toJSON()),
          total: dbExercises.length,
          source: "database",
        };
      }

      return { exercises: [], total: 0 };
    } catch (error) {
      logger.error(`❌ Error in getExercisesByLesson:`, error);
      return { exercises: [], total: 0 };
    }
  }

  /**
   * Generate exercise from lesson
   */
  async generateExerciseFromLesson(lessonId, type = null) {
    try {
      const lesson = await Lesson.findByPk(lessonId);
      if (!lesson) throw new Error("Lesson not found");

      const sections = lesson.sections || [];
      let questions = [];

      sections.forEach((section) => {
        if (section.type === "exercises" && section.data) {
          const data = section.data;
          const types = type ? [type] : ["vocabulary", "grammar", "reading"];

          types.forEach((t) => {
            if (data[t] && Array.isArray(data[t])) {
              data[t].forEach((exercise) => {
                if (exercise.questions) {
                  questions = [...questions, ...exercise.questions];
                }
              });
            }
          });
        }
      });

      return {
        id: `exercise-${Date.now()}`,
        lessonId,
        type: type || "mixed",
        level: lesson.level,
        questions: questions.slice(0, 10),
        totalQuestions: questions.length,
      };
    } catch (error) {
      logger.error(`❌ Error in generateExerciseFromLesson:`, error);
      throw error;
    }
  }

  /**
   * Submit exercise answers
   */
  async submitExercise(userId, exerciseId, answers, timeSpent = 0) {
    try {
      let exercise = await Exercise.findByPk(exerciseId);

      if (!exercise) {
        exercise = await Exercise.create({
          id: exerciseId || `temp-${Date.now()}`,
          userId,
          type: "mixed",
          level: "A1",
          questions: [],
          answers: {},
          score: 0,
          passed: false,
          xpEarned: 0,
        });
      }

      const questions = exercise.questions || [];
      let correctCount = 0;
      let totalQuestions = questions.length || Object.keys(answers).length;

      questions.forEach((q) => {
        const userAnswer = answers[q.id];
        if (userAnswer !== undefined && userAnswer !== null) {
          if (this.checkAnswer(q, userAnswer)) correctCount++;
        }
      });

      const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
      const passed = score >= 70;
      const xpEarned = passed ? Math.round((score / 100) * 50) : 0;

      await exercise.update({
        answers,
        score,
        passed,
        xpEarned,
        completedAt: passed ? new Date() : null,
        updatedAt: new Date(),
      });

      return { exercise, score, passed, xpEarned, correctCount, totalQuestions };
    } catch (error) {
      logger.error(`❌ Error in submitExercise:`, error);
      throw error;
    }
  }

  /**
   * Check if answer is correct
   */
  checkAnswer(question, userAnswer) {
    if (!question || userAnswer === undefined || userAnswer === null) return false;

    if (question.type === "multiple_choice" || question.correctIndex !== undefined) {
      const correct =
        question.correctIndex !== undefined ? question.correctIndex : question.correct;
      return userAnswer === correct;
    }

    if (question.type === "true_false") return userAnswer === question.answer;
    if (question.type === "fill_in" || question.type === "gap_fill") {
      const answer = question.answer || "";
      return userAnswer?.toLowerCase().trim() === answer.toLowerCase().trim();
    }
    if (question.type === "translation") {
      const answer = question.answer || "";
      return userAnswer?.toLowerCase().trim() === answer.toLowerCase().trim();
    }

    return userAnswer === question.correct || userAnswer === question.answer;
  }

  /**
   * Get user exercise history
   */
  async getUserExerciseHistory(userId, limit = 20) {
    try {
      const exercises = await Exercise.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
        limit,
      });
      return exercises.map((e) => e.toJSON());
    } catch (error) {
      logger.error(`❌ Error in getUserExerciseHistory:`, error);
      return [];
    }
  }

  /**
   * Get exercise statistics
   */
  async getExerciseStats(userId) {
    try {
      const total = await Exercise.count({ where: { userId } });
      const completed = await Exercise.count({ where: { userId, completedAt: { [Op.ne]: null } } });
      const passed = await Exercise.count({ where: { userId, passed: true } });
      const totalXP = await Exercise.sum("xpEarned", { where: { userId } });

      return {
        total,
        completed,
        passed,
        totalXP: totalXP || 0,
        passRate: total > 0 ? Math.round((passed / total) * 100) : 0,
      };
    } catch (error) {
      logger.error(`❌ Error in getExerciseStats:`, error);
      return { total: 0, completed: 0, passed: 0, totalXP: 0, passRate: 0 };
    }
  }
}

export default new ExerciseService();
