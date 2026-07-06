/**
 * userRepository.js
 * Path: backend/repositories/userRepository.js
 * Description: Repository for User model with specific query methods
 * Changes:
 * - ✅ FIXED: Added findByIdOrFail method
 * - ✅ FIXED: All methods work properly
 */

import { Op } from "sequelize";
import User from "../models/User.js";
import BaseRepository from "./baseRepository.js";
import logger from "../config/logger.js";
import { NotFoundError, ValidationError } from "../errors/index.js";

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  /**
   * Find user by ID
   */
  async findById(id, options = {}) {
    try {
      if (!id) {
        throw new ValidationError({
          message: "User ID is required",
          details: [{ field: "id", message: "User ID is required" }],
        });
      }

      const user = await this.model.findByPk(id, {
        attributes: {
          exclude: ["password", "refreshToken", "resetPasswordToken"],
        },
        ...options,
      });

      return user;
    } catch (error) {
      logger.error(`❌ UserRepository.findById error:`, {
        error: error.message,
        stack: error.stack,
        id,
      });
      throw error;
    }
  }

  /**
   * ✅ FIXED: Find user by ID or throw error
   */
  async findByIdOrFail(id, options = {}) {
    const user = await this.findById(id, options);
    if (!user) {
      throw new NotFoundError({
        message: `User with id "${id}" not found`,
        resource: { model: "User", id },
      });
    }
    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    try {
      if (!email) {
        throw new ValidationError({
          message: "Email is required",
          details: [{ field: "email", message: "Email is required" }],
        });
      }

      const user = await this.model.findOne({
        where: { email: email.toLowerCase().trim() },
      });

      return user;
    } catch (error) {
      logger.error(`❌ UserRepository.findByEmail error:`, {
        error: error.message,
        stack: error.stack,
        email,
      });
      throw error;
    }
  }

  /**
   * Find user by email or throw error
   */
  async findByEmailOrFail(email) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundError({
        message: `User with email "${email}" not found`,
        resource: { model: "User", email },
      });
    }
    return user;
  }

  /**
   * Find user by username
   */
  async findByUsername(username) {
    try {
      if (!username) {
        throw new ValidationError({
          message: "Username is required",
          details: [{ field: "username", message: "Username is required" }],
        });
      }

      const user = await this.model.findOne({
        where: { username: username.toLowerCase().trim() },
      });

      return user;
    } catch (error) {
      logger.error(`❌ UserRepository.findByUsername error:`, {
        error: error.message,
        stack: error.stack,
        username,
      });
      throw error;
    }
  }

  /**
   * Find user by username or throw error
   */
  async findByUsernameOrFail(username) {
    const user = await this.findByUsername(username);
    if (!user) {
      throw new NotFoundError({
        message: `User with username "${username}" not found`,
        resource: { model: "User", username },
      });
    }
    return user;
  }

  /**
   * Get top users by XP
   */
  async getTopByXP(limit = 10, offset = 0) {
    try {
      const users = await this.model.findAll({
        attributes: ["id", "name", "username", "xp", "level", "streak", "avatar", "createdAt"],
        order: [["xp", "DESC"]],
        limit: Math.min(limit, 100),
        offset: offset,
        where: { isActive: true },
      });
      return {
        users,
        total: users.length,
      };
    } catch (error) {
      logger.error(`❌ UserRepository.getTopByXP error:`, error);
      return { users: [], total: 0 };
    }
  }

  /**
   * Get top users by Level
   */
  async getTopByLevel(limit = 10, offset = 0) {
    try {
      const users = await this.model.findAll({
        attributes: ["id", "name", "username", "xp", "level", "streak", "avatar", "createdAt"],
        order: [
          ["level", "DESC"],
          ["xp", "DESC"],
        ],
        limit: Math.min(limit, 100),
        offset: offset,
        where: { isActive: true },
      });
      return {
        users,
        total: users.length,
      };
    } catch (error) {
      logger.error(`❌ UserRepository.getTopByLevel error:`, error);
      return { users: [], total: 0 };
    }
  }

  /**
   * Get top users by Streak
   */
  async getTopByStreak(limit = 10, offset = 0) {
    try {
      const users = await this.model.findAll({
        attributes: [
          "id",
          "name",
          "username",
          "streak",
          "longestStreak",
          "xp",
          "level",
          "avatar",
          "createdAt",
        ],
        where: {
          streak: { [Op.gt]: 0 },
          isActive: true,
        },
        order: [["streak", "DESC"]],
        limit: Math.min(limit, 100),
        offset: offset,
      });
      return {
        users,
        total: users.length,
      };
    } catch (error) {
      logger.error(`❌ UserRepository.getTopByStreak error:`, error);
      return { users: [], total: 0 };
    }
  }

  /**
   * Search users
   */
  async search(query, limit = 10) {
    try {
      if (!query || query.trim().length < 2) {
        return [];
      }

      const users = await this.model.findAll({
        attributes: ["id", "name", "username", "email", "avatar", "xp", "level", "streak"],
        where: {
          isActive: true,
          [Op.or]: [
            { name: { [Op.iLike]: `%${query}%` } },
            { username: { [Op.iLike]: `%${query}%` } },
            { email: { [Op.iLike]: `%${query}%` } },
          ],
        },
        limit,
        order: [["xp", "DESC"]],
      });

      return users;
    } catch (error) {
      logger.error(`❌ UserRepository.search error:`, error);
      return [];
    }
  }

  /**
   * Update streak
   */
  async updateStreak(userId) {
    try {
      const user = await this.findByIdOrFail(userId);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastActive = user.lastActiveDate;
      if (lastActive) {
        const lastDate = new Date(lastActive);
        lastDate.setHours(0, 0, 0, 0);

        const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          return user.streak;
        } else if (diffDays === 1) {
          user.streak += 1;
        } else {
          user.streak = 1;
        }
      } else {
        user.streak = 1;
      }

      user.lastActiveDate = today;
      await user.save();

      return user.streak;
    } catch (error) {
      logger.error(`❌ UserRepository.updateStreak error:`, error);
      throw error;
    }
  }

  /**
   * Add XP to user
   */
  async addXP(userId, amount) {
    try {
      const user = await this.findByIdOrFail(userId);

      const newXP = user.xp + amount;
      const newLevel = Math.floor(newXP / 100) + 1;

      await user.update({
        xp: newXP,
        level: newLevel,
      });

      return {
        xp: newXP,
        level: newLevel,
        leveledUp: newLevel > user.level,
      };
    } catch (error) {
      logger.error(`❌ UserRepository.addXP error:`, error);
      throw error;
    }
  }
}

export default new UserRepository();
