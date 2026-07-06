/**
 * storyService.js
 * Path: backend/services/storyService.js
 * Description: Story service for interactive stories
 * Changes:
 * - ✅ New file created
 * - ✅ CRUD operations for stories
 * - ✅ Progress tracking
 * - ✅ XP awarding
 */

import { Op } from "sequelize";
import { Story, StoryProgress, User } from "../models/index.js";
import logger from "../config/logger.js";
import userService from "./userService.js";

class StoryService {
  /**
   * Get all stories with user progress
   */
  async getStories(userId, filters = {}) {
    try {
      const { level, limit = 20, offset = 0 } = filters;

      const where = { isActive: true };
      if (level) where.level = level.toUpperCase();

      const { count, rows } = await Story.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [
          ["level", "ASC"],
          ["createdAt", "DESC"],
        ],
      });

      // Get user progress
      let progressMap = {};
      if (userId && rows.length > 0) {
        const storyIds = rows.map((s) => s.id);
        const progress = await StoryProgress.findAll({
          where: {
            userId,
            storyId: { [Op.in]: storyIds },
          },
        });
        progress.forEach((p) => {
          progressMap[p.storyId] = p;
        });
      }

      const stories = rows.map((story) => {
        const prog = progressMap[story.id];
        return {
          ...story.toJSON(),
          progress: prog
            ? {
                status: prog.status,
                progress: prog.progress,
                completedAt: prog.completedAt,
                xpEarned: prog.xpEarned,
              }
            : null,
          isCompleted: prog?.status === "completed",
        };
      });

      return {
        stories,
        total: count,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: count,
        },
      };
    } catch (error) {
      logger.error(`❌ Error in getStories:`, error);
      return {
        stories: [],
        total: 0,
        pagination: { limit: 20, offset: 0, total: 0 },
      };
    }
  }

  /**
   * Get story by ID with user progress
   */
  async getStory(storyId, userId) {
    try {
      const story = await Story.findByPk(storyId);
      if (!story) return null;

      let progress = null;
      if (userId) {
        progress = await StoryProgress.findOne({
          where: { userId, storyId },
        });
      }

      return {
        ...story.toJSON(),
        progress: progress
          ? {
              status: progress.status,
              progress: progress.progress,
              completedAt: progress.completedAt,
              xpEarned: progress.xpEarned,
            }
          : null,
      };
    } catch (error) {
      logger.error(`❌ Error in getStory:`, error);
      return null;
    }
  }

  /**
   * Start a story
   */
  async startStory(userId, storyId) {
    try {
      const story = await Story.findByPk(storyId);
      if (!story) throw new Error("Story not found");

      const [progress, created] = await StoryProgress.findOrCreate({
        where: { userId, storyId },
        defaults: {
          userId,
          storyId,
          status: "in_progress",
          progress: 0,
        },
      });

      return progress;
    } catch (error) {
      logger.error(`❌ Error in startStory:`, error);
      throw error;
    }
  }

  /**
   * Update story progress
   */
  async updateProgress(userId, storyId, data) {
    try {
      const { progress, status } = data;

      const storyProgress = await StoryProgress.findOne({
        where: { userId, storyId },
      });

      if (!storyProgress) {
        throw new Error("Story progress not found");
      }

      const isCompleted = status === "completed" && storyProgress.status !== "completed";

      await storyProgress.update({
        progress: progress || storyProgress.progress,
        status: status || storyProgress.status,
        completedAt: isCompleted ? new Date() : storyProgress.completedAt,
      });

      // Award XP if completed
      let xpEarned = 0;
      if (isCompleted) {
        const story = await Story.findByPk(storyId);
        xpEarned = story?.xpReward || 30;
        await userService.addXP(userId, xpEarned, "story_completion");
      }

      return {
        storyProgress,
        xpEarned,
        isCompleted,
      };
    } catch (error) {
      logger.error(`❌ Error in updateProgress:`, error);
      throw error;
    }
  }

  /**
   * Get story progress
   */
  async getProgress(userId, storyId) {
    try {
      const progress = await StoryProgress.findOne({
        where: { userId, storyId },
      });

      return (
        progress || {
          status: "not_started",
          progress: 0,
        }
      );
    } catch (error) {
      logger.error(`❌ Error in getProgress:`, error);
      return { status: "not_started", progress: 0 };
    }
  }
}

export default new StoryService();
