/**
 * lessonService.js
 * Path: backend/services/lessonService.js
 * Description: Lesson management service - Production Ready
 * Version: 6.0
 * Changes:
 * - ✅ FIXED: Removed include to avoid association error
 * - ✅ FIXED: Complete lesson content extraction
 * - ✅ FIXED: Exercise extraction from all sections
 * - ✅ FIXED: Vocabulary extraction from lesson
 * - ✅ FIXED: Grammar extraction from lesson
 * - ✅ FIXED: Dialogues extraction from lesson
 */

import { Op } from "sequelize";
import { Lesson, LessonProgress, User, Vocabulary } from "../models/index.js";
import userService from "./userService.js";
import logger from "../config/logger.js";

class LessonService {
  // ============================================
  // 📚 Get Lessons
  // ============================================

  async getLessons({ userId, level, search, limit = 50, offset = 0 }) {
    try {
      logger.info(`📚 Getting lessons for user: ${userId || "guest"}`);

      const where = { isActive: true };
      if (level) where.level = level;
      if (search) {
        where[Op.or] = [
          { id: { [Op.iLike]: `%${search}%` } },
          { title: { [Op.contains]: { fa: search } } },
          { title: { [Op.contains]: { en: search } } },
          { title: { [Op.contains]: { de: search } } },
        ];
      }

      const { rows: lessons, count: total } = await Lesson.findAndCountAll({
        where,
        limit,
        offset,
        order: [
          ["level", "ASC"],
          ["order", "ASC"],
        ],
      });

      logger.info(`✅ Found ${total} lessons in database`);

      // Get user progress
      if (userId && lessons.length > 0) {
        const lessonIds = lessons.map((l) => l.id);
        const progressList = await LessonProgress.findAll({
          where: {
            userId,
            lessonId: { [Op.in]: lessonIds },
          },
        });

        const progressMap = {};
        progressList.forEach((p) => {
          progressMap[p.lessonId] = p;
        });

        const enrichedLessons = lessons.map((lesson) => {
          const lessonJson = lesson.toJSON();
          const progress = progressMap[lesson.id];
          return {
            ...lessonJson,
            progress: progress ? progress.toJSON() : null,
          };
        });

        return { lessons: enrichedLessons, total, limit, offset };
      }

      return { lessons: lessons.map((l) => l.toJSON()), total, limit, offset };
    } catch (error) {
      logger.error(`❌ Error in getLessons:`, error);
      return { lessons: [], total: 0, limit, offset };
    }
  }

  // ============================================
  // 📖 Get Lesson by ID (با تمام محتوا)
  // ============================================

  async getLessonById(lessonId, userId) {
    try {
      logger.info(`📖 Getting lesson: ${lessonId}`);

      const lesson = await Lesson.findByPk(lessonId);

      if (!lesson) {
        logger.warn(`⚠️ Lesson not found: ${lessonId}`);
        return null;
      }

      const result = lesson.toJSON();

      // ✅ استخراج و ساختاردهی محتوای درس
      result.content = this.extractLessonContent(result);

      // ✅ استخراج تمرین‌ها
      result.exercises = this.extractExercises(result);

      // ✅ استخراج واژگان
      result.vocabulary = this.extractVocabulary(result);

      // ✅ استخراج گرامر
      result.grammar = this.extractGrammar(result);

      // ✅ استخراج دیالوگ‌ها
      result.dialogues = this.extractDialogues(result);

      if (userId) {
        const progress = await LessonProgress.findOne({
          where: { userId, lessonId },
        });
        result.progress = progress ? progress.toJSON() : null;
      }

      return result;
    } catch (error) {
      logger.error(`❌ Error in getLessonById:`, error);
      return null;
    }
  }

  // ============================================
  // 📊 Extract Lesson Content
  // ============================================

  extractLessonContent(lesson) {
    const sections = lesson.sections || [];
    const content = {
      introduction: null,
      vocabulary: [],
      grammar: [],
      dialogues: [],
      exercises: [],
      review: null,
      assessment: null,
      cheatSheet: null,
      cultureNotes: null,
      pronunciationGuide: null,
      greetings: [],
    };

    sections.forEach((section) => {
      switch (section.type) {
        case "introduction":
          content.introduction = {
            title: section.title || {},
            content: section.content || {},
            imagePrompt: section.imagePrompt || null,
          };
          break;

        case "pronunciation_guide":
          content.pronunciationGuide = {
            title: section.title || {},
            layers: section.layers || {},
            sounds: section.sounds || [],
          };
          break;

        case "greetings":
          content.greetings = section.items || [];
          break;

        case "vocabulary":
          content.vocabulary = section.items || [];
          break;

        case "grammar":
          content.grammar = section.topics || [];
          break;

        case "dialogues":
          content.dialogues = section.items || [];
          break;

        case "culture_notes":
          content.cultureNotes = section.content || {};
          break;

        case "exercises":
          content.exercises = this.extractExercisesFromSection(section);
          break;

        case "review":
          content.review = {
            title: section.titleObj || {},
            quiz: section.quiz || [],
          };
          break;

        case "assessment":
          content.assessment = {
            title: section.titleObj || {},
            totalQuestions: section.totalQuestions || 15,
            passingScore: section.passingScore || 70,
            sections: section.sections || {},
            selfEvaluation: section.selfEvaluation || {},
          };
          break;

        case "cheat_sheet":
          content.cheatSheet = {
            greetings: section.greetings || [],
            pronouns: section.pronouns || [],
            keyPhrases: section.keyPhrases || [],
            grammar: section.grammar || [],
            duVsSie: section.duVsSie || [],
          };
          break;
      }
    });

    return content;
  }

  // ============================================
  // 📊 Extract Exercises
  // ============================================

  extractExercises(lesson) {
    const sections = lesson.sections || [];
    const allExercises = [];

    sections.forEach((section) => {
      if (section.type === "exercises" && section.data) {
        const exercises = this.extractExercisesFromSection(section);
        allExercises.push(...exercises);
      }
    });

    return allExercises;
  }

  extractExercisesFromSection(section) {
    const data = section.data || {};
    const exercises = [];
    const types = ["vocabulary", "grammar", "reading", "listening", "writing", "mixed"];

    types.forEach((type) => {
      if (data[type] && Array.isArray(data[type])) {
        data[type].forEach((exercise, index) => {
          if (exercise.questions && Array.isArray(exercise.questions)) {
            exercises.push({
              id: exercise.id || `${type}-${index}`,
              type: type,
              title: exercise.title || `${type} exercise`,
              questions: exercise.questions.map((q) => ({
                id: q.id || `q-${index}-${Math.random().toString(36).substr(2, 6)}`,
                type: q.type || "multiple_choice",
                question: q.question || q,
                options: q.options || [],
                correct: q.correct !== undefined ? q.correct : q.correctIndex || 0,
                explanation: q.explanation || "",
              })),
              difficulty: exercise.difficulty || 1,
              xpReward: exercise.xpReward || 10,
            });
          }
        });
      }
    });

    // ✅ استخراج از greeting_practice
    if (data.greeting_practice && Array.isArray(data.greeting_practice)) {
      data.greeting_practice.forEach((exercise, index) => {
        if (exercise.questions && Array.isArray(exercise.questions)) {
          exercises.push({
            id: `greeting-${index}`,
            type: "greeting_practice",
            title: exercise.title || "تمرین احوال‌پرسی",
            questions: exercise.questions.map((q) => ({
              id: q.id || `g-${index}-${Math.random().toString(36).substr(2, 6)}`,
              type: q.type || "multiple_choice",
              question: q.question || q.situation || q,
              options: q.options || [],
              correct: q.correct !== undefined ? q.correct : q.correctIndex || 0,
              explanation: q.explanation || "",
            })),
            difficulty: exercise.difficulty || 1,
            xpReward: exercise.xpReward || 10,
          });
        }
      });
    }

    // ✅ استخراج از du_vs_sie
    if (data.du_vs_sie && Array.isArray(data.du_vs_sie)) {
      data.du_vs_sie.forEach((exercise, index) => {
        if (exercise.questions && Array.isArray(exercise.questions)) {
          exercises.push({
            id: `duvsie-${index}`,
            type: "du_vs_sie",
            title: exercise.title || "تمرین du و Sie",
            questions: exercise.questions.map((q) => ({
              id: q.id || `d-${index}-${Math.random().toString(36).substr(2, 6)}`,
              type: q.type || "multiple_choice",
              question: q.question || q.situation || q,
              options: q.options || ["du", "Sie"],
              correct: q.correct !== undefined ? q.correct : q.correctIndex || 0,
              explanation: q.explanation || "",
            })),
            difficulty: exercise.difficulty || 1,
            xpReward: exercise.xpReward || 10,
          });
        }
      });
    }

    return exercises;
  }

  // ============================================
  // 📊 Extract Vocabulary
  // ============================================

  extractVocabulary(lesson) {
    const sections = lesson.sections || [];
    let allVocabulary = [];

    sections.forEach((section) => {
      if (section.type === "vocabulary" && section.items) {
        allVocabulary = [...allVocabulary, ...section.items];
      }
    });

    return allVocabulary;
  }

  // ============================================
  // 📊 Extract Grammar
  // ============================================

  extractGrammar(lesson) {
    const sections = lesson.sections || [];
    let allGrammar = [];

    sections.forEach((section) => {
      if (section.type === "grammar" && section.topics) {
        allGrammar = [...allGrammar, ...section.topics];
      }
    });

    return allGrammar;
  }

  // ============================================
  // 📊 Extract Dialogues
  // ============================================

  extractDialogues(lesson) {
    const sections = lesson.sections || [];
    let allDialogues = [];

    sections.forEach((section) => {
      if (section.type === "dialogues" && section.items) {
        allDialogues = [...allDialogues, ...section.items];
      }
    });

    return allDialogues;
  }

  // ============================================
  // 📊 User Stats
  // ============================================

  async getUserLessonStats(userId) {
    try {
      const totalLessons = await Lesson.count({ where: { isActive: true } });
      const completedLessons = await LessonProgress.count({
        where: { userId, status: { [Op.in]: ["completed", "perfect"] } },
      });
      const perfectLessons = await LessonProgress.count({
        where: { userId, status: "perfect" },
      });
      const inProgress = await LessonProgress.count({
        where: { userId, status: "in_progress" },
      });
      const user = await User.findByPk(userId);

      return {
        totalLessons: totalLessons || 0,
        completedLessons: completedLessons || 0,
        perfectLessons: perfectLessons || 0,
        inProgress: inProgress || 0,
        totalXP: user?.xp || 0,
      };
    } catch (error) {
      logger.error(`❌ Error in getUserLessonStats:`, error);
      return { totalLessons: 0, completedLessons: 0, perfectLessons: 0, inProgress: 0, totalXP: 0 };
    }
  }

  // ============================================
  // ✅ Complete Lesson
  // ============================================

  async completeLesson({ lessonId, userId, answers, timeSpent = 0 }) {
    try {
      const lesson = await Lesson.findByPk(lessonId);
      if (!lesson) throw new Error("Lesson not found");

      const score = this.calculateScore(lesson, answers);
      const xpEarned = score >= 70 ? lesson.xpReward || 50 : 0;

      const progress = await LessonProgress.findOne({
        where: { userId, lessonId },
      });

      if (progress) {
        await progress.update({
          status: score === 100 ? "perfect" : "completed",
          score,
          xpEarned,
          answers,
          timeSpent,
          completedAt: new Date(),
        });
      } else {
        await LessonProgress.create({
          userId,
          lessonId,
          status: score === 100 ? "perfect" : "completed",
          score,
          xpEarned,
          answers,
          timeSpent,
          completedAt: new Date(),
        });
      }

      if (xpEarned > 0) {
        await userService.addXP(userId, xpEarned, "lesson_completion");
      }

      return {
        lessonId,
        score,
        xpEarned,
        isPerfect: score === 100,
        isPassed: score >= 70,
        progress,
      };
    } catch (error) {
      logger.error(`❌ Error in completeLesson:`, error);
      throw error;
    }
  }

  // ============================================
  // 🛠️ Calculate Score
  // ============================================

  calculateScore(lesson, answers) {
    const exercises = this.extractExercises(lesson);
    let totalQuestions = 0;
    let correctAnswers = 0;

    exercises.forEach((exercise) => {
      exercise.questions.forEach((q) => {
        totalQuestions++;
        const userAnswer = answers[q.id];
        if (userAnswer !== undefined && userAnswer !== null) {
          if (this.checkAnswer(q, userAnswer)) correctAnswers++;
        }
      });
    });

    // همچنین review و assessment را بررسی کنید
    const sections = lesson.sections || [];
    sections.forEach((section) => {
      if (section.type === "review" && section.quiz) {
        section.quiz.forEach((q) => {
          totalQuestions++;
          if (this.checkAnswer(q, answers[q.id])) correctAnswers++;
        });
      }
      if (section.type === "assessment") {
        Object.values(section.sections || {}).forEach((sectionData) => {
          if (sectionData.questions && Array.isArray(sectionData.questions)) {
            sectionData.questions.forEach((q) => {
              totalQuestions++;
              if (this.checkAnswer(q, answers[q.id])) correctAnswers++;
            });
          }
        });
      }
    });

    if (totalQuestions === 0) return 100;
    return Math.round((correctAnswers / totalQuestions) * 100);
  }

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

  // ============================================
  // 📊 Other Methods
  // ============================================

  async getLessonProgress(userId, lessonId) {
    return LessonProgress.findOne({ where: { userId, lessonId } });
  }

  async getSuggestions(userId, count = 3) {
    const result = await this.getLessons({ userId, limit: count });
    return result.lessons || [];
  }

  async checkLessonLock(userId, lessonId) {
    return { locked: false };
  }

  async resetLessonProgress(userId, lessonId) {
    const progress = await LessonProgress.findOne({ where: { userId, lessonId } });
    if (progress) await progress.destroy();
    return { success: true };
  }

  async getLevels(userId) {
    return ["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => ({
      id: level,
      name: level,
      progress: 0,
    }));
  }

  async getLevelProgress(userId, level) {
    return { level, progress: 0, totalLessons: 0, completedLessons: 0 };
  }
}

export default new LessonService();
