/**
 * analyticsController.js
 * Path: backend/controllers/analyticsController.js
 * Description: Analytics controller
 */

import { asyncHandler } from "../middlewares/errorHandler.js";
import { LessonProgress, User, XPHistory } from "../models/index.js";
import { Op } from "sequelize";
import logger from "../config/logger.js";

export const trackEvent = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { event, data = {} } = req.body;

  logger.info(`📊 Analytics event: ${event}`, { userId, data });

  res.json({ success: true, message: "Event tracked" });
});

export const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findByPk(userId);
  const totalXP = await XPHistory.sum("amount", { where: { userId } });

  const completedLessons = await LessonProgress.count({
    where: { userId, status: { [Op.in]: ["completed", "perfect"] } },
  });

  const perfectLessons = await LessonProgress.count({
    where: { userId, status: "perfect" },
  });

  res.json({
    success: true,
    data: {
      totalXP: totalXP || 0,
      completedLessons,
      perfectLessons,
      level: user?.level || 1,
      streak: user?.streak || 0,
    },
  });
});

export const getWeeklyActivity = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const days = 7;

  const date = new Date();
  date.setDate(date.getDate() - days);

  const activities = await LessonProgress.findAll({
    where: {
      userId,
      completedAt: { [Op.gte]: date },
      status: { [Op.in]: ["completed", "perfect"] },
    },
    attributes: [
      [LessonProgress.sequelize.fn("DATE", LessonProgress.sequelize.col("completedAt")), "date"],
      [LessonProgress.sequelize.fn("COUNT", LessonProgress.sequelize.col("id")), "count"],
      [LessonProgress.sequelize.fn("SUM", LessonProgress.sequelize.col("xpEarned")), "xp"],
    ],
    group: [LessonProgress.sequelize.fn("DATE", LessonProgress.sequelize.col("completedAt"))],
    order: [
      [LessonProgress.sequelize.fn("DATE", LessonProgress.sequelize.col("completedAt")), "ASC"],
    ],
  });

  res.json({ success: true, data: activities });
});

export const getLearningInsights = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const totalCompleted = await LessonProgress.count({
    where: { userId, status: { [Op.in]: ["completed", "perfect"] } },
  });

  const scores = await LessonProgress.findAll({
    where: { userId, status: { [Op.in]: ["completed", "perfect"] } },
    attributes: ["score"],
  });

  const avgScore =
    scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length) : 0;

  const totalXP = await XPHistory.sum("amount", { where: { userId } });

  res.json({
    success: true,
    data: {
      totalLessonsCompleted: totalCompleted,
      averageScore: avgScore,
      totalXP: totalXP || 0,
      suggestedNextLevel: avgScore >= 80 ? "A2" : "A1",
    },
  });
});
