/**
 * xpService.js
 * Path: backend/services/xpService.js
 * Description: Unified XP management service
 * Version: 2.0 - Integrated with User model and userService
 * Changes:
 * - ✅ Unified XP logic from User.js, userService.js, and xpService.js
 * - ✅ Single source of truth for XP calculations
 * - ✅ Atomic operations using increment()
 */

import { User, XPHistory } from "../models/index.js";
import sequelize from "../config/db.js";
import logger from "../config/logger.js";

const XP_PER_LEVEL = 100;

class XPService {
  /**
   * Calculate level based on XP
   */
  calculateLevel(xp) {
    return Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1;
  }

  /**
   * Get XP required for a specific level
   */
  getXPForLevel(level) {
    return Math.max(0, (level - 1) * XP_PER_LEVEL);
  }

  /**
   * Get XP required for next level
   */
  getXPForNextLevel(currentXP) {
    const currentLevel = this.calculateLevel(currentXP);
    return currentLevel * XP_PER_LEVEL;
  }

  /**
   * Calculate progress to next level (percentage)
   */
  getProgressToNextLevel(xp) {
    const currentLevel = this.calculateLevel(xp);
    const xpForCurrentLevel = this.getXPForLevel(currentLevel);
    const xpForNextLevel = this.getXPForLevel(currentLevel + 1);
    const xpInCurrentLevel = Math.max(0, xp - xpForCurrentLevel);
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;

    if (xpNeeded === 0) return 100;
    return Math.min(Math.round((xpInCurrentLevel / xpNeeded) * 100), 100);
  }

  /**
   * Add XP to user - ATOMIC operation
   * ✅ Single source of truth for XP addition
   * ✅ Uses increment() to avoid race conditions
   */
  async addXP(userId, amount, source = "unknown", sourceId = null, metadata = {}) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      if (amount <= 0) {
        logger.warn(`⚠️ Attempted to add non-positive XP: ${amount} for user ${userId}`);
        return { xp: 0, level: 0, leveledUp: false };
      }

      const transaction = await sequelize.transaction();

      try {
        // ✅ Atomic increment
        const [updatedUser] = await User.increment(
          { xp: amount },
          {
            where: { id: userId },
            returning: true,
            transaction,
          }
        );

        const user = updatedUser?.[0] || (await User.findByPk(userId, { transaction }));
        const newXP = user?.xp || 0;
        const oldLevel = this.calculateLevel(newXP - amount);
        const newLevel = this.calculateLevel(newXP);

        // Update level if changed
        if (newLevel !== oldLevel) {
          await user.update({ level: newLevel }, { transaction });
        }

        // Log XP history
        await XPHistory.create(
          {
            userId,
            amount,
            totalXP: newXP,
            source,
            sourceId,
            metadata,
          },
          { transaction }
        );

        await transaction.commit();

        logger.info(`➕ User ${userId} earned ${amount} XP (total: ${newXP}, level: ${newLevel})`);

        return {
          xp: newXP,
          level: newLevel,
          earned: amount,
          leveledUp: newLevel > oldLevel,
          oldLevel,
          progress: this.getProgressToNextLevel(newXP),
        };
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      logger.error(`❌ Error in addXP:`, error);
      throw error;
    }
  }

  /**
   * Calculate XP reward for lesson
   */
  calculateLessonXP(lesson, performance) {
    const baseXP = lesson.xpReward || 50;
    const bonusMultiplier = performance >= 100 ? 1.5 : 1;
    const bonusXP = performance >= 100 ? lesson.perfectBonusXP || 25 : 0;

    return {
      base: baseXP,
      bonus: bonusXP,
      total: Math.round(baseXP * bonusMultiplier + bonusXP),
      isPerfect: performance >= 100,
    };
  }

  /**
   * Calculate daily goal progress
   */
  getDailyGoalProgress(todayXP, dailyGoal = 50) {
    return {
      current: todayXP,
      goal: dailyGoal,
      progress: Math.min(Math.round((todayXP / dailyGoal) * 100), 100),
      completed: todayXP >= dailyGoal,
      remaining: Math.max(0, dailyGoal - todayXP),
    };
  }

  /**
   * Get XP for different activities
   */
  getActivityXP(activity, options = {}) {
    const xpMap = {
      lesson_complete: 50,
      lesson_perfect: 75,
      exercise: 10,
      quiz: 25,
      daily_streak: 10,
      achievement: 50,
      ai_chat: 5,
      grammar_correction: 3,
      translation: 3,
      vocabulary_learned: 2,
      story_read: 30,
      scenario_complete: 50,
      mentor_session: 100,
    };

    return xpMap[activity] || 10;
  }
}

// ============================================
// 📤 Export
// ============================================

const xpService = new XPService();
export default xpService;
