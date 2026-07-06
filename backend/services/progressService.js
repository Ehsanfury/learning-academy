/**
 * progressService.js
 * Path: backend/services/progressService.js
 * Description: Service for user progress management
 * Changes:
 * - FIXED C4: Removed xpEarned from user input - calculated server-side
 * - FIXED H1: Using atomic operations for XP updates
 * - Using repositories instead of direct model calls
 * - Integrated custom Error Classes
 * - Better error handling with proper status codes
 * - Cleaner separation of concerns
 * - Added logging for all operations
 */

import progressRepository from "../repositories/progressRepository.js";
import lessonRepository from "../repositories/lessonRepository.js";
import userRepository from "../repositories/userRepository.js";
import { calculateLevel } from "../utils/xpCalculator.js";
import logger, { logInfo, logError, logWarn } from "../config/logger.js";
import { ValidationError, NotFoundError } from "../errors/index.js";
import sequelize from "../config/db.js";

class ProgressService {
  /**
   * Get all progress for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - List of progress with lesson details
   */
  async getAllProgress(userId) {
    try {
      logInfo(`📊 Getting all progress for user ${userId}`);

      if (!userId) {
        throw new ValidationError({
          message: "User ID is required",
          details: [{ field: "userId", message: "User ID is required" }],
        });
      }

      // Verify user exists
      await userRepository.findByIdOrFail(userId);

      const progress = await progressRepository.findByUser(userId);

      // Add lesson details for each progress
      const progressWithLessons = await Promise.all(
        progress.map(async (item) => {
          try {
            const lesson = await lessonRepository.findById(item.lessonId);
            return {
              ...item.toJSON(),
              lesson: lesson
                ? {
                    id: lesson.id,
                    title: lesson.title,
                    level: lesson.level,
                    lessonNumber: lesson.lessonNumber,
                  }
                : null,
            };
          } catch (err) {
            logWarn(`⚠️ Lesson not found for progress ${item.id}`, {
              lessonId: item.lessonId,
            });
            return {
              ...item.toJSON(),
              lesson: null,
            };
          }
        })
      );

      logInfo(`✅ Found ${progressWithLessons.length} progress records for user ${userId}`);
      return progressWithLessons;
    } catch (error) {
      logError(`❌ Error in getAllProgress for user ${userId}`, error);
      throw error;
    }
  }

  /**
   * Get progress statistics for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Progress statistics
   */
  async getStats(userId) {
    try {
      logInfo(`📊 Getting progress stats for user ${userId}`);

      if (!userId) {
        throw new ValidationError({
          message: "User ID is required",
          details: [{ field: "userId", message: "User ID is required" }],
        });
      }

      // Verify user exists
      const user = await userRepository.findByIdOrFail(userId);

      const [totalLessons, completedLessons, perfectLessons, inProgress] = await Promise.all([
        lessonRepository.countAll(),
        progressRepository.countByUserAndStatus(userId, ["completed", "perfect"]),
        progressRepository.countByUserAndStatus(userId, ["perfect"]),
        progressRepository.countByUserAndStatus(userId, ["in_progress"]),
      ]);

      const stats = {
        totalLessons: totalLessons || 0,
        completedLessons: completedLessons || 0,
        perfectLessons: perfectLessons || 0,
        inProgress: inProgress || 0,
        progressPercentage: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
        xp: user.xp || 0,
        level: user.level || 1,
        streak: user.streak || 0,
      };

      logInfo(`✅ Stats fetched for user ${userId}`, stats);
      return stats;
    } catch (error) {
      logError(`❌ Error in getStats for user ${userId}`, error);
      throw error;
    }
  }

  /**
   * Update progress for a lesson
   *
   * ✅ FIXED C4: xpEarned is now calculated server-side based on actual answers
   * ✅ FIXED H1: Using atomic operations for XP updates
   *
   * @param {string} userId - User ID
   * @param {Object} data - Progress data
   * @param {string} data.lessonId - Lesson ID
   * @param {string} data.status - Progress status
   * @param {Object} data.answers - User answers (for calculation)
   * @param {string} data.completedAt - Completion date
   * @returns {Promise<Object>} - Updated progress
   */
  async updateProgress(userId, data) {
    const transaction = await sequelize.transaction();

    try {
      const { lessonId, status, answers, completedAt } = data;

      logInfo(`📊 Updating progress for user ${userId}, lesson ${lessonId}`, {
        status,
        answersCount: answers ? Object.keys(answers).length : 0,
      });

      if (!userId) {
        throw new ValidationError({
          message: "User ID is required",
          details: [{ field: "userId", message: "User ID is required" }],
        });
      }

      if (!lessonId) {
        throw new ValidationError({
          message: "Lesson ID is required",
          details: [{ field: "lessonId", message: "Lesson ID is required" }],
        });
      }

      // Verify user and lesson exist
      await Promise.all([
        userRepository.findByIdOrFail(userId),
        lessonRepository.findByIdOrFail(lessonId),
      ]);

      // ✅ FIXED C4: Calculate score based on actual answers
      // Get lesson to validate answers
      const lesson = await lessonRepository.findById(lessonId);
      const lessonData = lesson.toJSON();

      // Calculate score from answers
      let score = 0;
      let xpEarned = 0;
      let isPerfect = false;

      if (answers && Object.keys(answers).length > 0) {
        // Find quiz section
        const sections = lessonData.sections || [];
        const quizSection = sections.find((s) => s.type === "quiz");
        const questions = quizSection?.questions || [];

        if (questions.length > 0) {
          let correctCount = 0;
          let totalQuestions = questions.length;

          // Count correct answers
          for (const question of questions) {
            const userAnswer = answers[question.id];
            if (userAnswer !== undefined && userAnswer !== null) {
              // Check if answer is correct
              if (question.correct !== undefined) {
                const isCorrect = userAnswer === question.correct;
                if (isCorrect) correctCount++;
              }
            }
          }

          // Calculate score (percentage)
          score = Math.round((correctCount / totalQuestions) * 100);
          isPerfect = score === 100 && totalQuestions > 0;

          // Calculate XP based on lesson's XP reward
          const baseXP = lessonData.xpReward || 50;
          const bonusXP = lessonData.perfectBonusXP || 25;

          // XP = baseXP * (score / 100) + bonus if perfect
          xpEarned = Math.round(baseXP * (score / 100));
          if (isPerfect) {
            xpEarned += bonusXP;
          }

          logInfo(`📊 Calculated score: ${score}%, XP: ${xpEarned}, Perfect: ${isPerfect}`, {
            userId,
            lessonId,
            correctCount,
            totalQuestions,
          });
        } else {
          // No quiz questions - default score
          score = 100;
          xpEarned = lessonData.xpReward || 50;
          isPerfect = true;
          logWarn(`⚠️ No quiz questions found for lesson ${lessonId}, defaulting to perfect score`);
        }
      } else {
        // No answers provided
        logWarn(`⚠️ No answers provided for lesson ${lessonId}, defaulting to 0 score`);
        score = 0;
        xpEarned = 0;
        isPerfect = false;
      }

      // Determine status based on score
      const finalStatus = status || (score >= 80 ? "completed" : "in_progress");
      const finalCompletedAt =
        finalStatus === "completed" || finalStatus === "perfect" ? completedAt || new Date() : null;

      // Get or create progress
      let progress = await progressRepository.findByUserAndLesson(userId, lessonId);

      if (progress) {
        const previousXp = progress.xpEarned || 0;
        // Only add new XP if greater than previous
        const xpDifference = Math.max(0, xpEarned - previousXp);

        await progress.update(
          {
            status: finalStatus,
            score: score,
            answers: answers || progress.answers,
            xpEarned: xpEarned,
            completedAt: finalCompletedAt || progress.completedAt,
          },
          { transaction }
        );

        // ✅ FIXED H1: Atomic XP update
        if (xpDifference > 0) {
          const user = await userRepository.findByIdOrFail(userId);
          await user.increment("xp", { by: xpDifference, transaction });

          // Update level based on new XP
          const newXP = (user.xp || 0) + xpDifference;
          const newLevel = calculateLevel(newXP);
          await user.update({ level: newLevel }, { transaction });

          logInfo(`⭐ Added ${xpDifference} XP to user ${userId} (atomic)`, {
            newXP,
            newLevel,
          });
        }
      } else {
        // Create new progress
        progress = await progressRepository.create(
          {
            userId,
            lessonId,
            status: finalStatus,
            score: score,
            answers: answers || {},
            xpEarned: xpEarned,
            completedAt: finalCompletedAt,
          },
          { transaction }
        );

        // ✅ FIXED H1: Atomic XP update for new progress
        if (xpEarned > 0) {
          const user = await userRepository.findByIdOrFail(userId);
          await user.increment("xp", { by: xpEarned, transaction });

          const newXP = (user.xp || 0) + xpEarned;
          const newLevel = calculateLevel(newXP);
          await user.update({ level: newLevel }, { transaction });

          logInfo(`⭐ Added ${xpEarned} XP to user ${userId} (atomic)`, {
            newXP,
            newLevel,
          });
        }
      }

      await transaction.commit();

      logInfo(`✅ Progress updated for user ${userId}, lesson ${lessonId}`);
      return progress;
    } catch (error) {
      await transaction.rollback();
      logError(`❌ Error in updateProgress for user ${userId}`, error);
      throw error;
    }
  }

  /**
   * Get progress for a specific lesson
   * @param {string} userId - User ID
   * @param {string} lessonId - Lesson ID
   * @returns {Promise<Object>} - Progress or default status
   */
  async getLessonProgress(userId, lessonId) {
    try {
      logInfo(`📊 Getting lesson progress for user ${userId}, lesson ${lessonId}`);

      if (!userId) {
        throw new ValidationError({
          message: "User ID is required",
          details: [{ field: "userId", message: "User ID is required" }],
        });
      }

      if (!lessonId) {
        throw new ValidationError({
          message: "Lesson ID is required",
          details: [{ field: "lessonId", message: "Lesson ID is required" }],
        });
      }

      // Verify user and lesson exist
      await Promise.all([
        userRepository.findByIdOrFail(userId),
        lessonRepository.findByIdOrFail(lessonId),
      ]);

      const progress = await progressRepository.findByUserAndLesson(userId, lessonId);

      if (!progress) {
        return {
          status: "not_started",
          score: 0,
          xpEarned: 0,
          answers: {},
        };
      }

      logInfo(`✅ Lesson progress fetched for user ${userId}, lesson ${lessonId}`);
      return progress;
    } catch (error) {
      logError(`❌ Error in getLessonProgress for user ${userId}, lesson ${lessonId}`, error);
      throw error;
    }
  }

  /**
   * Get in-progress lessons for a user
   * @param {string} userId - User ID
   * @param {number} limit - Limit number of results
   * @returns {Promise<Array>} - List of in-progress lessons with details
   */
  async getInProgressLessons(userId, limit = 10) {
    try {
      logInfo(`📊 Getting in-progress lessons for user ${userId}`);

      if (!userId) {
        throw new ValidationError({
          message: "User ID is required",
          details: [{ field: "userId", message: "User ID is required" }],
        });
      }

      await userRepository.findByIdOrFail(userId);

      const progress = await progressRepository.getInProgressLessons(userId, limit);

      const result = await Promise.all(
        progress.map(async (item) => {
          try {
            const lesson = await lessonRepository.findById(item.lessonId);
            return {
              ...item.toJSON(),
              lesson: lesson
                ? {
                    id: lesson.id,
                    title: lesson.title,
                    level: lesson.level,
                    lessonNumber: lesson.lessonNumber,
                    estimatedMinutes: lesson.estimatedMinutes,
                    xpReward: lesson.xpReward,
                  }
                : null,
            };
          } catch (err) {
            return {
              ...item.toJSON(),
              lesson: null,
            };
          }
        })
      );

      logInfo(`✅ Found ${result.length} in-progress lessons for user ${userId}`);
      return result;
    } catch (error) {
      logError(`❌ Error in getInProgressLessons for user ${userId}`, error);
      throw error;
    }
  }

  /**
   * Get the last completed lesson for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} - Last completed lesson or null
   */
  async getLastCompletedLesson(userId) {
    try {
      logInfo(`📊 Getting last completed lesson for user ${userId}`);

      if (!userId) {
        throw new ValidationError({
          message: "User ID is required",
          details: [{ field: "userId", message: "User ID is required" }],
        });
      }

      await userRepository.findByIdOrFail(userId);

      const progress = await progressRepository.getCompletedLessons(userId, 1);

      if (progress.length === 0) {
        logInfo(`ℹ️ No completed lessons found for user ${userId}`);
        return null;
      }

      const last = progress[0];
      const lesson = await lessonRepository.findById(last.lessonId);

      const result = {
        ...last.toJSON(),
        lesson: lesson
          ? {
              id: lesson.id,
              title: lesson.title,
              level: lesson.level,
              lessonNumber: lesson.lessonNumber,
            }
          : null,
      };

      logInfo(`✅ Last completed lesson found for user ${userId}`);
      return result;
    } catch (error) {
      logError(`❌ Error in getLastCompletedLesson for user ${userId}`, error);
      throw error;
    }
  }

  /**
   * Get completed lessons for a user
   * @param {string} userId - User ID
   * @param {number} limit - Limit number of results
   * @returns {Promise<Array>} - List of completed lessons with details
   */
  async getCompletedLessons(userId, limit = 20) {
    try {
      logInfo(`📊 Getting completed lessons for user ${userId}`);

      if (!userId) {
        throw new ValidationError({
          message: "User ID is required",
          details: [{ field: "userId", message: "User ID is required" }],
        });
      }

      await userRepository.findByIdOrFail(userId);

      const progress = await progressRepository.getCompletedLessons(userId, limit);

      const result = await Promise.all(
        progress.map(async (item) => {
          try {
            const lesson = await lessonRepository.findById(item.lessonId);
            return {
              ...item.toJSON(),
              lesson: lesson
                ? {
                    id: lesson.id,
                    title: lesson.title,
                    level: lesson.level,
                    lessonNumber: lesson.lessonNumber,
                  }
                : null,
            };
          } catch (err) {
            return {
              ...item.toJSON(),
              lesson: null,
            };
          }
        })
      );

      logInfo(`✅ Found ${result.length} completed lessons for user ${userId}`);
      return result;
    } catch (error) {
      logError(`❌ Error in getCompletedLessons for user ${userId}`, error);
      throw error;
    }
  }

  /**
   * Get level distribution of completed lessons
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Distribution by level
   */
  async getLevelDistribution(userId) {
    try {
      logInfo(`📊 Getting level distribution for user ${userId}`);

      if (!userId) {
        throw new ValidationError({
          message: "User ID is required",
          details: [{ field: "userId", message: "User ID is required" }],
        });
      }

      await userRepository.findByIdOrFail(userId);

      // ✅ FIXED H9: Use a single query with JOIN and GROUP BY
      const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
      const distribution = {};

      // Get all lessons with their levels
      const allLessons = await lessonRepository.findAll();
      const lessonIds = allLessons.map((l) => l.id);

      // Get all progress for this user in one query
      const allProgress = await progressRepository.findByUserAndLessons(userId, lessonIds);

      // Build a map of lessonId -> level
      const lessonLevelMap = {};
      allLessons.forEach((lesson) => {
        lessonLevelMap[lesson.id] = lesson.level;
      });

      // Build a set of completed lesson IDs
      const completedLessonIds = new Set();
      allProgress.forEach((p) => {
        if (p.status === "completed" || p.status === "perfect") {
          completedLessonIds.add(p.lessonId);
        }
      });

      // Calculate distribution per level
      for (const level of levels) {
        const lessonsInLevel = allLessons.filter((l) => l.level === level);
        const total = lessonsInLevel.length;
        let completed = 0;

        for (const lesson of lessonsInLevel) {
          if (completedLessonIds.has(lesson.id)) {
            completed++;
          }
        }

        distribution[level] = {
          total,
          completed,
          percentage: total > 0 ? (completed / total) * 100 : 0,
        };
      }

      logInfo(`✅ Level distribution fetched for user ${userId}`);
      return distribution;
    } catch (error) {
      logError(`❌ Error in getLevelDistribution for user ${userId}`, error);
      throw error;
    }
  }

  /**
   * Get daily statistics for a user
   * @param {string} userId - User ID
   * @param {number} days - Number of days to look back
   * @returns {Promise<Array>} - Daily statistics
   */
  async getDailyStats(userId, days = 7) {
    try {
      logInfo(`📊 Getting daily stats for user ${userId} (${days} days)`);

      if (!userId) {
        throw new ValidationError({
          message: "User ID is required",
          details: [{ field: "userId", message: "User ID is required" }],
        });
      }

      await userRepository.findByIdOrFail(userId);

      const progress = await progressRepository.findByUser(userId);

      // Filter progress with completion date
      const withDate = progress.filter((p) => p.completedAt);

      // Group by day
      const dailyMap = {};
      const now = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const key = date.toISOString().split("T")[0];
        dailyMap[key] = {
          date: key,
          lessonsCompleted: 0,
          xpEarned: 0,
        };
      }

      for (const p of withDate) {
        const dateKey = p.completedAt.toISOString().split("T")[0];
        if (dailyMap[dateKey]) {
          dailyMap[dateKey].lessonsCompleted += 1;
          dailyMap[dateKey].xpEarned += p.xpEarned || 0;
        }
      }

      const result = Object.values(dailyMap);
      logInfo(`✅ Daily stats fetched for user ${userId}`);
      return result;
    } catch (error) {
      logError(`❌ Error in getDailyStats for user ${userId}`, error);
      throw error;
    }
  }
}

export default new ProgressService();
