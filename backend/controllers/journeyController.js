/**
 * journeyController.js
 * Path: backend/controllers/journeyController.js
 */

import { Op } from "sequelize";
import { Lesson, LessonProgress } from "../models/index.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

export const getJourney = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const lessons = await Lesson.findAll({
    where: { isActive: true },
    order: [
      ["level", "ASC"],
      ["order", "ASC"],
    ],
  });

  const progress = await LessonProgress.findAll({
    where: { userId },
  });

  const progressMap = {};
  progress.forEach((p) => {
    progressMap[p.lessonId] = p;
  });

  const journey = lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    level: lesson.level,
    order: lesson.order,
    status: progressMap[lesson.id]?.status || "not_started",
    score: progressMap[lesson.id]?.score || 0,
    xpEarned: progressMap[lesson.id]?.xpEarned || 0,
    completedAt: progressMap[lesson.id]?.completedAt || null,
  }));

  res.json({ success: true, data: journey });
});

export const getJourneyStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const total = await Lesson.count({ where: { isActive: true } });
  const completed = await LessonProgress.count({
    where: { userId, status: { [Op.in]: ["completed", "perfect"] } },
  });

  res.json({
    success: true,
    data: {
      total,
      completed,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0,
    },
  });
});
