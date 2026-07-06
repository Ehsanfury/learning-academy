/**
 * streakService.js
 * German Academy
 Streak management service
 * Changes:
 * - FIXED H1: Changed addStreakBonusXP to use atomic increment
 * - FIXED H6: Improved timezone handling with UTC
 * - FIXED M19: Fixed resetStreak to return correct previousStreak
 * - FIXED M20: Implemented autoCheckAllStreaks with cron support
 * - L5: Improved getDateString with slice instead of split
 * - L6: Emojis kept for better log readability
 */

import { Op } from "sequelize";
import User from "../models/User.js";
import achievementService from "./achievementService.js";
import sequelize from "../config/db.js";
import { logInfo, logError, logWarn } from "../config/logger.js";

class StreakService {
  /**
// TODO: Translate - TODO: Translate - * ثابت‌های مربوط به گل‌زنی
   */
  static STREAK_BONUS_XP = 10;
  static STREAK_MILESTONES = {
    7: { xpBonus: 25, achievement: "streak_7" },
    14: { xpBonus: 50, achievement: "streak_14" },
    30: { xpBonus: 100, achievement: "streak_30" },
    60: { xpBonus: 200, achievement: "streak_60" },
    100: { xpBonus: 500, achievement: "streak_100" },
    365: { xpBonus: 1000, achievement: "streak_365" },
  };

  /**
   * ✅ L5: Get date string with slice instead of split
   * ✅ FIXED H6: Uses UTC to avoid timezone issues
   */
  getDateString(date) {
    if (!date) return null;
    const d = new Date(date);
// TODO: Translate - TODO: Translate - // ✅ L5: استفاده از slice به جای split
    return d.toISOString().slice(0, 10);
  }

  /**
   * ✅ FIXED H6: Get today's date in UTC
   */
  getTodayUTC() {
    return new Date().toISOString().slice(0, 10);
  }

  /**
// TODO: Translate - TODO: Translate - * به‌روزرسانی گل‌زنی کاربر
   * ✅ FIXED H6: All date comparisons use UTC
   */
  async updateStreak(userId, activityDate = new Date()) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // ✅ FIXED H6: Use UTC for all date calculations
    const today = this.getDateString(activityDate);
    const lastActive = user.lastActiveDate ? this.getDateString(user.lastActiveDate) : null;

    let streak = user.streak || 0;
    let longestStreak = user.longestStreak || 0;
    let streakUpdated = false;

// TODO: Translate - TODO: Translate - // اگر امروز قبلاً ثبت شده، هیچ تغییری نکن
    if (lastActive === today) {
      return {
        streak,
        longestStreak,
        updated: false,
        message: "Already active today",
      };
    }

    // ✅ FIXED H6: Calculate yesterday in UTC
    const yesterday = new Date(activityDate);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayStr = this.getDateString(yesterday);

// TODO: Translate - TODO: Translate - // اگر آخرین فعالیت دیروز بوده => گل‌زنی ادامه داره
    if (lastActive === yesterdayStr) {
      streak = (streak || 0) + 1;
      streakUpdated = true;
    }
// TODO: Translate - TODO: Translate - // اگر آخرین فعالیت قبل از دیروز بوده => گل‌زنی قطع شده
    else if (lastActive && lastActive !== today && lastActive !== yesterdayStr) {
      streak = 1;
      streakUpdated = true;
    }
// TODO: Translate - TODO: Translate - // اگر هیچ فعالیتی ثبت نشده (کاربر جدید)
    else if (!lastActive) {
      streak = 1;
      streakUpdated = true;
    }

// TODO: Translate - TODO: Translate - // به‌روزرسانی طولانی‌ترین گل‌زنی
    if (streak > longestStreak) {
      longestStreak = streak;
    }

// TODO: Translate - TODO: Translate - // ذخیره تغییرات
    if (streakUpdated) {
      await user.update({
        streak,
        longestStreak,
        lastActiveDate: activityDate,
        lastLoginAt: activityDate,
      });

// TODO: Translate - TODO: Translate - // اعطای جایزه گل‌زنی
      const rewards = await this.checkStreakRewards(userId, streak);

      return {
        streak,
        longestStreak,
        updated: true,
        rewards,
        message: `Streak updated to ${streak} days`,
      };
    }

    return {
      streak,
      longestStreak,
      updated: false,
      message: "No streak update needed",
    };
  }

  /**
// TODO: Translate - TODO: Translate - * بررسی و اعطای جوایز گل‌زنی
   */
  async checkStreakRewards(userId, streak) {
    const rewards = [];

// TODO: Translate - TODO: Translate - // بررسی نقاط عطف گل‌زنی
    for (const [milestone, reward] of Object.entries(StreakService.STREAK_MILESTONES)) {
      if (streak === parseInt(milestone)) {
// TODO: Translate - TODO: Translate - // اضافه کردن XP جایزه
        if (reward.xpBonus > 0) {
          await this.addStreakBonusXP(userId, reward.xpBonus);
          rewards.push({
            type: "xp",
            amount: reward.xpBonus,
            message: `${reward.xpBonus} XP bonus for ${streak}-day streak!`,
          });
        }

// TODO: Translate - TODO: Translate - // اعطای دستاورد
        if (reward.achievement) {
          try {
            const achievement = await achievementService.awardAchievement(
              userId,
              reward.achievement
            );
            if (achievement) {
              rewards.push({
                type: "achievement",
                achievement: achievement,
                message: `Achievement unlocked: ${achievement.name}`,
              });
            }
          } catch (error) {
            console.error("Error awarding streak achievement:", error);
          }
        }
      }
    }

// TODO: Translate - TODO: Translate - // XP روزانه برای حفظ گل‌زنی (هر روز)
    if (streak >= 2) {
      await this.addStreakBonusXP(userId, StreakService.STREAK_BONUS_XP);
      rewards.push({
        type: "daily_streak_xp",
        amount: StreakService.STREAK_BONUS_XP,
        message: `${StreakService.STREAK_BONUS_XP} XP for maintaining streak!`,
      });
    }

    return rewards;
  }

  /**
// TODO: Translate - TODO: Translate - * ✅ FIXED H1: اضافه کردن XP جایزه گل‌زنی با atomic operation
   */
  async addStreakBonusXP(userId, xpAmount) {
    const transaction = await sequelize.transaction();

    try {
      const user = await User.findByPk(userId, { transaction, lock: true });
      if (!user) {
        throw new Error("User not found");
      }

      // ✅ FIXED H1: Use atomic increment
      const xpPerLevel = 100;
      const newXP = (user.xp || 0) + xpAmount;
      const newLevel = Math.floor(newXP / xpPerLevel) + 1;

      await user.increment("xp", { by: xpAmount, transaction });
      await user.update({ level: newLevel }, { transaction });

      await user.reload({ transaction });

      await transaction.commit();

      return { xp: user.xp, level: user.level };
    } catch (error) {
      await transaction.rollback();
      console.error("Error adding streak bonus XP:", error);
      throw error;
    }
  }

  /**
// TODO: Translate - TODO: Translate - * دریافت آمار گل‌زنی کاربر
   */
  async getStreakStats(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const today = this.getDateString(new Date());
    const lastActive = user.lastActiveDate ? this.getDateString(user.lastActiveDate) : null;

    const isActiveToday = lastActive === today;

    const nextMilestones = [];
    for (const [milestone, reward] of Object.entries(StreakService.STREAK_MILESTONES)) {
      if (parseInt(milestone) > (user.streak || 0)) {
        const daysLeft = parseInt(milestone) - (user.streak || 0);
        nextMilestones.push({
          days: parseInt(milestone),
          daysLeft,
          xpBonus: reward.xpBonus,
          achievement: reward.achievement,
        });
        break;
      }
    }

    const dailyBonus = (user.streak || 0) >= 2 ? StreakService.STREAK_BONUS_XP : 0;

    return {
      currentStreak: user.streak || 0,
      longestStreak: user.longestStreak || 0,
      isActiveToday,
      lastActiveDate: user.lastActiveDate,
      dailyBonusXP: dailyBonus,
      nextMilestone: nextMilestones[0] || null,
    };
  }

  /**
// TODO: Translate - TODO: Translate - * دریافت کاربران با بیشترین گل‌زنی (برای لیدربورد)
   */
  async getTopStreakers(limit = 10) {
    return await User.findAll({
      attributes: ["id", "name", "streak", "longestStreak", "xp", "level"],
      where: {
        streak: {
          [Op.gt]: 0,
        },
      },
      order: [["streak", "DESC"]],
      limit,
    });
  }

  /**
// TODO: Translate - TODO: Translate - * ✅ FIXED M19: ریست کردن گل‌زنی کاربر با previousStreak صحیح
   */
  async resetStreak(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const lastActive = user.lastActiveDate ? this.getDateString(user.lastActiveDate) : null;
    const today = this.getDateString(new Date());

    if (lastActive === today) {
      return {
        reset: false,
        message: "User is active today, cannot reset",
      };
    }

    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayStr = this.getDateString(yesterday);

    if (lastActive === yesterdayStr) {
      return {
        reset: false,
        message: "User was active yesterday, streak is still alive",
      };
    }

    if (lastActive && lastActive !== today && lastActive !== yesterdayStr) {
      // ✅ FIXED M19: Save previousStreak BEFORE updating
      const previousStreak = user.streak || 0;

      await user.update({
        streak: 0,
      });

      return {
        reset: true,
        message: "Streak reset to 0",
        previousStreak: previousStreak,
      };
    }

    return {
      reset: false,
      message: "No reset needed",
    };
  }

  /**
// TODO: Translate - TODO: Translate - * ثبت فعالیت روزانه کاربر
   */
  async logDailyActivity(userId, activityType = "login") {
    const result = await this.updateStreak(userId);

    console.log(`📊 Activity logged: ${activityType} - User: ${userId} - Streak: ${result.streak}`);

    return result;
  }

  /**
// TODO: Translate - TODO: Translate - * ✅ FIXED M20: بررسی خودکار گل‌زنی همه کاربران
// TODO: Translate - TODO: Translate - * این متد برای کرون جاب هر روز در نیمه‌شب اجرا می‌شود
   */
  async autoCheckAllStreaks() {
    const transaction = await sequelize.transaction();

    try {
      logInfo("🔄 Running auto streak check...");

      const users = await User.findAll({
        where: {
          streak: {
            [Op.gt]: 0,
          },
        },
        transaction,
      });

      logInfo(`📊 Checking streaks for ${users.length} users`);

      const results = [];
      const today = this.getDateString(new Date());
      const yesterday = new Date();
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      const yesterdayStr = this.getDateString(yesterday);

      for (const user of users) {
        const lastActive = user.lastActiveDate ? this.getDateString(user.lastActiveDate) : null;

// TODO: Translate - TODO: Translate - // اگر آخرین فعالیت قبل از دیروز باشه، گل‌زنی قطع شده
        if (lastActive && lastActive !== today && lastActive !== yesterdayStr) {
          const previousStreak = user.streak || 0;

          await user.update(
            {
              streak: 0,
            },
            { transaction }
          );

          results.push({
            userId: user.id,
            name: user.name,
            email: user.email,
            previousStreak,
            reset: true,
            reason: `Last active: ${lastActive}`,
          });

          logInfo(`🔄 Reset streak for user ${user.id}: ${previousStreak} -> 0`);
        }
      }

      await transaction.commit();

      logInfo(`✅ Auto streak check completed. Reset ${results.length} users.`);

      // Log summary
      if (results.length > 0) {
        console.log(`\n📊 Streak Reset Summary:`);
        console.log(`   Total users checked: ${users.length}`);
        console.log(`   Reset count: ${results.length}`);
        console.log(`   Details:`);
        results.forEach((r) => {
          console.log(`   - ${r.name} (${r.email}): ${r.previousStreak} days`);
        });
      }

      return results;
    } catch (error) {
      await transaction.rollback();
      logError("❌ Error in autoCheckAllStreaks:", error);
      throw error;
    }
  }

  /**
// TODO: Translate - TODO: Translate - * دریافت خلاصه وضعیت گل‌زنی برای داشبورد ادمین
   */
  async getStreakSummary() {
    try {
      const totalUsers = await User.count({
        where: {
          streak: {
            [Op.gt]: 0,
          },
        },
      });

      const averageStreak = await User.findOne({
        attributes: [[sequelize.fn("AVG", sequelize.col("streak")), "averageStreak"]],
        where: {
          streak: {
            [Op.gt]: 0,
          },
        },
        raw: true,
      });

      const maxStreak = await User.findOne({
        attributes: ["streak", "name", "id"],
        where: {
          streak: {
            [Op.gt]: 0,
          },
        },
        order: [["streak", "DESC"]],
        limit: 1,
      });

      const streakDistribution = await User.findAll({
        attributes: [
          [
            sequelize.literal(
              "CASE WHEN streak = 0 THEN '0' WHEN streak <= 3 THEN '1-3' WHEN streak <= 7 THEN '4-7' WHEN streak <= 14 THEN '8-14' WHEN streak <= 30 THEN '15-30' ELSE '30+' END"
            ),
            "range",
          ],
          [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        ],
        group: [
          sequelize.literal(
            "CASE WHEN streak = 0 THEN '0' WHEN streak <= 3 THEN '1-3' WHEN streak <= 7 THEN '4-7' WHEN streak <= 14 THEN '8-14' WHEN streak <= 30 THEN '15-30' ELSE '30+' END"
          ),
        ],
        raw: true,
      });

      return {
        totalActiveUsers: totalUsers,
        averageStreak: Math.round(parseFloat(averageStreak?.averageStreak || 0)),
        maxStreak: maxStreak
          ? {
              streak: maxStreak.streak,
              userId: maxStreak.id,
              name: maxStreak.name,
            }
          : null,
        distribution: streakDistribution,
      };
    } catch (error) {
      logError("❌ Error in getStreakSummary:", error);
      throw error;
    }
  }
}

export default new StreakService();
