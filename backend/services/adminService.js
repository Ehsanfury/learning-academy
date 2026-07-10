/**
 * adminService.js
 * Path: backend/services/adminService.js
 * Description: Admin service for managing all admin operations
 */

import { Op } from "sequelize";
import {
  User,
  Lesson,
  LessonProgress,
  Exercise,
  Achievement,
  UserAchievement,
  XPHistory,
} from "../models/index.js";
import logger from "../config/logger.js";

class AdminService {
  // ============================================
  // 📊 Statistics
  // ============================================

  async getStats() {
    try {
      const totalUsers = await User.count({ where: { isActive: true } });
      const totalLessons = await Lesson.count();
      const totalExercises = await Exercise.count();
      const totalAchievements = await Achievement.count({ where: { isActive: true } });
      const totalXP = (await XPHistory.sum("amount")) || 0;

      // Today's stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStats = await LessonProgress.count({
        where: {
          completedAt: { [Op.gte]: today },
          status: { [Op.in]: ["completed", "perfect"] },
        },
      });

      return {
        users: totalUsers,
        lessons: totalLessons,
        exercises: totalExercises,
        achievements: totalAchievements,
        totalXP: totalXP,
        todayCompleted: todayStats,
      };
    } catch (error) {
      logger.error("❌ Error in getStats:", error);
      throw error;
    }
  }

  async getUserStats() {
    try {
      const total = await User.count({ where: { isActive: true } });
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const activeToday = await User.count({
        where: {
          lastActiveDate: { [Op.gte]: today },
        },
      });

      const withStreak = await User.count({
        where: { streak: { [Op.gt]: 0 } },
      });

      return {
        total,
        activeToday,
        withStreak,
      };
    } catch (error) {
      logger.error("❌ Error in getUserStats:", error);
      throw error;
    }
  }

  async getLessonStats() {
    try {
      const total = await Lesson.count();
      const published = await Lesson.count({ where: { status: "published" } });
      const draft = await Lesson.count({ where: { status: "draft" } });
      const archived = await Lesson.count({ where: { status: "archived" } });

      const completed = await LessonProgress.count({
        where: { status: { [Op.in]: ["completed", "perfect"] } },
      });

      return {
        total,
        published,
        draft,
        archived,
        completed,
      };
    } catch (error) {
      logger.error("❌ Error in getLessonStats:", error);
      throw error;
    }
  }

  async getActivityStats() {
    try {
      const last7Days = [];
      const today = new Date();

      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const count = await LessonProgress.count({
          where: {
            completedAt: {
              [Op.gte]: date,
              [Op.lt]: nextDate,
            },
            status: { [Op.in]: ["completed", "perfect"] },
          },
        });

        last7Days.push({
          date: date.toISOString().split("T")[0],
          count,
        });
      }

      return last7Days.reverse();
    } catch (error) {
      logger.error("❌ Error in getActivityStats:", error);
      throw error;
    }
  }

  // ============================================
  // 📚 Lesson Management
  // ============================================

  async getLessons({ limit = 50, offset = 0, search = "", status = "" }) {
    try {
      const where = {};
      if (search) {
        where[Op.or] = [
          { id: { [Op.iLike]: `%${search}%` } },
          { title: { [Op.contains]: { fa: search } } },
          { title: { [Op.contains]: { en: search } } },
        ];
      }
      if (status) {
        where.status = status;
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

      return { lessons, total };
    } catch (error) {
      logger.error("❌ Error in getLessons:", error);
      throw error;
    }
  }

  async getLessonById(id) {
    try {
      const lesson = await Lesson.findByPk(id);
      return lesson;
    } catch (error) {
      logger.error("❌ Error in getLessonById:", error);
      throw error;
    }
  }

  async createLesson(data) {
    try {
      const lesson = await Lesson.create(data);
      logger.info(`✅ Lesson created: ${lesson.id}`);
      return lesson;
    } catch (error) {
      logger.error("❌ Error in createLesson:", error);
      throw error;
    }
  }

  async updateLesson(id, data) {
    try {
      const lesson = await Lesson.findByPk(id);
      if (!lesson) return null;
      await lesson.update(data);
      logger.info(`✅ Lesson updated: ${id}`);
      return lesson;
    } catch (error) {
      logger.error("❌ Error in updateLesson:", error);
      throw error;
    }
  }

  async deleteLesson(id) {
    try {
      const lesson = await Lesson.findByPk(id);
      if (!lesson) return null;
      await lesson.destroy();
      logger.info(`🗑️ Lesson deleted: ${id}`);
      return { success: true };
    } catch (error) {
      logger.error("❌ Error in deleteLesson:", error);
      throw error;
    }
  }

  async updateLessonStatus(id, status) {
    try {
      const lesson = await Lesson.findByPk(id);
      if (!lesson) return null;
      await lesson.update({ status });
      logger.info(`✅ Lesson status updated: ${id} → ${status}`);
      return lesson;
    } catch (error) {
      logger.error("❌ Error in updateLessonStatus:", error);
      throw error;
    }
  }

  // ============================================
  // 🏋️ Exercise Management
  // ============================================

  async getExercises({ limit = 50, offset = 0, search = "" }) {
    try {
      const where = {};
      if (search) {
        where[Op.or] = [
          { type: { [Op.iLike]: `%${search}%` } },
          { level: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { rows: exercises, count: total } = await Exercise.findAndCountAll({
        where,
        limit,
        offset,
        order: [["created_at", "DESC"]],
      });

      return { exercises, total };
    } catch (error) {
      logger.error("❌ Error in getExercises:", error);
      throw error;
    }
  }

  async getExerciseById(id) {
    try {
      const exercise = await Exercise.findByPk(id);
      return exercise;
    } catch (error) {
      logger.error("❌ Error in getExerciseById:", error);
      throw error;
    }
  }

  async createExercise(data) {
    try {
      const exercise = await Exercise.create(data);
      logger.info(`✅ Exercise created: ${exercise.id}`);
      return exercise;
    } catch (error) {
      logger.error("❌ Error in createExercise:", error);
      throw error;
    }
  }

  async updateExercise(id, data) {
    try {
      const exercise = await Exercise.findByPk(id);
      if (!exercise) return null;
      await exercise.update(data);
      logger.info(`✅ Exercise updated: ${id}`);
      return exercise;
    } catch (error) {
      logger.error("❌ Error in updateExercise:", error);
      throw error;
    }
  }

  async deleteExercise(id) {
    try {
      const exercise = await Exercise.findByPk(id);
      if (!exercise) return null;
      await exercise.destroy();
      logger.info(`🗑️ Exercise deleted: ${id}`);
      return { success: true };
    } catch (error) {
      logger.error("❌ Error in deleteExercise:", error);
      throw error;
    }
  }

  // ============================================
  // 👤 User Management
  // ============================================

  async getUsers({ limit = 50, offset = 0, search = "" }) {
    try {
      const where = {};
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
          { username: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const { rows: users, count: total } = await User.findAndCountAll({
        where,
        attributes: { exclude: ["password"] },
        limit,
        offset,
        order: [["created_at", "DESC"]], // ✅ FIXED: changed from "createdAt" to "created_at"
      });

      return { users, total };
    } catch (error) {
      logger.error("❌ Error in getUsers:", error);
      throw error;
    }
  }

  async getUserById(id) {
    try {
      const user = await User.findByPk(id, {
        attributes: { exclude: ["password"] },
        include: [
          {
            model: LessonProgress,
            as: "userLessonProgresses",
            limit: 5,
            order: [["created_at", "DESC"]],
          },
        ],
      });
      return user;
    } catch (error) {
      logger.error("❌ Error in getUserById:", error);
      throw error;
    }
  }

  async updateUser(id, data) {
    try {
      const user = await User.findByPk(id);
      if (!user) return null;
      await user.update(data);
      logger.info(`✅ User updated: ${id}`);
      return user;
    } catch (error) {
      logger.error("❌ Error in updateUser:", error);
      throw error;
    }
  }

  async updateUserRole(id, role) {
    try {
      const user = await User.findByPk(id);
      if (!user) return null;
      await user.update({ role });
      logger.info(`✅ User role updated: ${id} → ${role}`);
      return user;
    } catch (error) {
      logger.error("❌ Error in updateUserRole:", error);
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      const user = await User.findByPk(id);
      if (!user) return null;
      await user.destroy();
      logger.info(`🗑️ User deleted: ${id}`);
      return { success: true };
    } catch (error) {
      logger.error("❌ Error in deleteUser:", error);
      throw error;
    }
  }

  // ============================================
  // 🏆 Achievement Management
  // ============================================

  async getAchievements({ limit = 50, offset = 0, search = "" }) {
    try {
      const where = {};
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { title: { [Op.contains]: { fa: search } } },
        ];
      }

      const { rows: achievements, count: total } = await Achievement.findAndCountAll({
        where,
        limit,
        offset,
        order: [["displayOrder", "ASC"]],
      });

      return { achievements, total };
    } catch (error) {
      logger.error("❌ Error in getAchievements:", error);
      throw error;
    }
  }

  async getAchievementById(id) {
    try {
      const achievement = await Achievement.findByPk(id);
      return achievement;
    } catch (error) {
      logger.error("❌ Error in getAchievementById:", error);
      throw error;
    }
  }

  async createAchievement(data) {
    try {
      const achievement = await Achievement.create(data);
      logger.info(`✅ Achievement created: ${achievement.name}`);
      return achievement;
    } catch (error) {
      logger.error("❌ Error in createAchievement:", error);
      throw error;
    }
  }

  async updateAchievement(id, data) {
    try {
      const achievement = await Achievement.findByPk(id);
      if (!achievement) return null;
      await achievement.update(data);
      logger.info(`✅ Achievement updated: ${id}`);
      return achievement;
    } catch (error) {
      logger.error("❌ Error in updateAchievement:", error);
      throw error;
    }
  }

  async deleteAchievement(id) {
    try {
      const achievement = await Achievement.findByPk(id);
      if (!achievement) return null;
      await achievement.destroy();
      logger.info(`🗑️ Achievement deleted: ${id}`);
      return { success: true };
    } catch (error) {
      logger.error("❌ Error in deleteAchievement:", error);
      throw error;
    }
  }
}

export default new AdminService();
