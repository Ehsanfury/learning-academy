/**
 * lessonService.js
 * Path: backend/services/lessonService.js
 * Description: Lesson management service
 * Changes:
 * - ✅ FIXED: XP is properly awarded on lesson completion
 * - ✅ FIXED: calculateScore now requires questions to award XP
 * - ✅ FIXED: Added Achievement check on lesson completion
 * - ✅ FIXED: Added Streak logging on lesson completion
 */

import { Op } from "sequelize";
import { Lesson, LessonProgress, User, XPHistory } from "../models/index.js";
import lessonRepository from "../repositories/lessonRepository.js";
import progressRepository from "../repositories/progressRepository.js";
import userService from "../services/userService.js";
import xpService from "../services/xpService.js";
import achievementService from "../services/achievementService.js";
import streakService from "../services/streakService.js";
import logger from "../config/logger.js";

class LessonService {
  // ============================================
  // 📚 Get Lessons
  // ============================================

  async getLessons({ userId, level, search, limit = 50, offset = 0 }) {
    try {
      logger.info(`📚 Getting lessons for user: ${userId || "guest"}`);

      const where = { isActive: true };
      if (level) {
        where.level = level;
      }
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

        return {
          lessons: enrichedLessons,
          total,
          limit,
          offset,
        };
      }

      return {
        lessons: lessons.map((l) => l.toJSON()),
        total,
        limit,
        offset,
      };
    } catch (error) {
      logger.error(`❌ Error in getLessons:`, error);
      return {
        lessons: [],
        total: 0,
        limit,
        offset,
      };
    }
  }

  // ============================================
  // 📊 Get User Lesson Stats
  // ============================================

  async getUserLessonStats(userId) {
    try {
      logger.info(`📊 Getting lesson stats for user: ${userId}`);

      const totalLessons = await Lesson.count({
        where: { isActive: true },
      });

      const completedLessons = await LessonProgress.count({
        where: {
          userId,
          status: {
            [Op.in]: ["completed", "perfect"],
          },
        },
      });

      const perfectLessons = await LessonProgress.count({
        where: {
          userId,
          status: "perfect",
        },
      });

      const inProgress = await LessonProgress.count({
        where: {
          userId,
          status: "in_progress",
        },
      });

      const user = await User.findByPk(userId);
      const totalXP = user?.xp || 0;

      return {
        totalLessons: totalLessons || 0,
        completedLessons: completedLessons || 0,
        perfectLessons: perfectLessons || 0,
        inProgress: inProgress || 0,
        totalXP,
      };
    } catch (error) {
      logger.error(`❌ Error in getUserLessonStats:`, error);
      return {
        totalLessons: 0,
        completedLessons: 0,
        perfectLessons: 0,
        inProgress: 0,
        totalXP: 0,
      };
    }
  }

  // ============================================
  // 📖 Get Lesson by ID
  // ============================================

  async getLessonById(lessonId, userId) {
    try {
      const lesson = await Lesson.findByPk(lessonId);

      if (!lesson) {
        return null;
      }

      const result = lesson.toJSON();

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
  // ✅ Complete Lesson
  // ============================================

  async completeLesson({ lessonId, userId, answers, timeSpent = 0 }) {
    try {
      // Find lesson
      const lesson = await Lesson.findByPk(lessonId);
      if (!lesson) {
        throw new Error("Lesson not found");
      }

      // ✅ FIXED: Calculate score with proper question counting
      const score = this.calculateScore(lesson, answers);

      // ✅ FIXED: Only award XP if there are actual questions and score >= 70
      const hasQuestions = this.hasQuestions(lesson);
      const xpEarned = hasQuestions && score >= 70 ? lesson.xpReward || 50 : 0;

      // Update or create progress
      const [progress, created] = await LessonProgress.findOrCreate({
        where: { userId, lessonId },
        defaults: {
          userId,
          lessonId,
          status: score === 100 ? "perfect" : "completed",
          score: score,
          xpEarned: xpEarned,
          answers: answers,
          timeSpent: timeSpent,
          completedAt: new Date(),
        },
      });

      if (!created) {
        await progress.update({
          status: score === 100 ? "perfect" : "completed",
          score: score,
          xpEarned: xpEarned,
          answers: answers,
          timeSpent: timeSpent,
          completedAt: new Date(),
        });
      }

      let totalXP = 0;

      // ✅ Add XP to user (only if earned)
      if (xpEarned > 0) {
        const xpResult = await userService.addXP(userId, xpEarned, "lesson_completion");
        totalXP = xpResult.xp || 0;

        logger.info(
          `✅ User ${userId} earned ${xpEarned} XP from lesson ${lessonId} (total: ${totalXP})`
        );

        // Check and award achievements
        try {
          const achievementResult = await achievementService.checkAndAwardAchievements(
            userId,
            "lesson_completed",
            {
              lessonId,
              score,
              xpEarned,
              isPerfect: score === 100,
            }
          );

          if (achievementResult && achievementResult.count > 0) {
            logger.info(`🏆 User ${userId} earned ${achievementResult.count} new achievement(s)`);
          }
        } catch (achievementError) {
          logger.error(`❌ Achievement check failed: ${achievementError.message}`);
        }

        // Log daily activity for streak
        try {
          const streakResult = await streakService.logDailyActivity(userId, "lesson_completed");
          logger.info(`📊 User ${userId} streak updated: ${streakResult.streak || 0} days`);
        } catch (streakError) {
          logger.error(`❌ Streak update failed: ${streakError.message}`);
        }
      }

      return {
        lessonId,
        score,
        xpEarned: xpEarned,
        totalXP: totalXP,
        isPerfect: score === 100,
        isPassed: score >= 70,
        hasQuestions: hasQuestions,
        progress,
      };
    } catch (error) {
      logger.error(`❌ Error in completeLesson:`, error);
      throw error;
    }
  }

  // ============================================
  // 🛠️ Helper Methods
  // ============================================

  /**
   * ✅ FIXED: Check if lesson has any questions
   */
  hasQuestions(lesson) {
    const sections = lesson.sections || [];
    let totalQuestions = 0;

    sections.forEach((section) => {
      if (section.questions) {
        totalQuestions += section.questions.length;
      }
    });

    return totalQuestions > 0;
  }

  /**
   * ✅ FIXED: Calculate score with proper question counting
   */
  calculateScore(lesson, answers) {
    const sections = lesson.sections || [];
    let totalQuestions = 0;
    let correctAnswers = 0;

    sections.forEach((section) => {
      if (section.questions) {
        section.questions.forEach((q) => {
          totalQuestions++;
          const userAnswer = answers[q.id];
          if (q.type === "multiple_choice") {
            if (userAnswer === q.correctIndex) {
              correctAnswers++;
            }
          } else if (q.type === "fill_in" || q.type === "translation") {
            if (userAnswer?.toLowerCase().trim() === q.answer?.toLowerCase().trim()) {
              correctAnswers++;
            }
          }
        });
      }
    });

    // ✅ FIXED: If no questions, return 0 (no XP awarded)
    if (totalQuestions === 0) return 0;
    return Math.round((correctAnswers / totalQuestions) * 100);
  }

  // ============================================
  // 📊 Other Methods
  // ============================================

  async getLessonProgress(userId, lessonId) {
    return LessonProgress.findOne({
      where: { userId, lessonId },
    });
  }

  async getSuggestions(userId, count = 3) {
    const result = await this.getLessons({ userId, limit: count });
    return result.lessons || [];
  }

  async checkLessonLock(userId, lessonId) {
    return { locked: false };
  }

  async resetLessonProgress(userId, lessonId) {
    const progress = await LessonProgress.findOne({
      where: { userId, lessonId },
    });
    if (progress) {
      await progress.destroy();
    }
    return { success: true };
  }

  async getLevels(userId) {
    const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
    return levels.map((level) => ({
      id: level,
      name: level,
      progress: 0,
    }));
  }

  async getLevelProgress(userId, level) {
    return {
      level,
      progress: 0,
      totalLessons: 0,
      completedLessons: 0,
    };
  }
}

export default new LessonService();
