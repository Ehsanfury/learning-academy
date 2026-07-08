/**
 * notificationController.js
 * Path: backend/controllers/notificationController.js
 * Description: Notification controller
 */

import { asyncHandler } from "../middlewares/errorHandler.js";
import { Notification, UserNotification } from "../models/index.js";
import logger from "../config/logger.js";

export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20 } = req.query;

  const offset = (parseInt(page) - 1) * parseInt(limit);

  const { rows: notifications, count: total } = await UserNotification.findAndCountAll({
    where: { userId },
    include: [
      {
        model: Notification,
        as: "notification",
      },
    ],
    order: [["createdAt", "DESC"]],
    limit: parseInt(limit),
    offset,
  });

  res.json({
    success: true,
    data: notifications,
    pagination: { total, page: parseInt(page), limit: parseInt(limit) },
  });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const userNotification = await UserNotification.findOne({
    where: { userId, notificationId: id },
  });

  if (!userNotification) {
    return res.status(404).json({ success: false, message: "Notification not found" });
  }

  await userNotification.update({ isRead: true, readAt: new Date() });

  res.json({ success: true, message: "Notification marked as read" });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await UserNotification.update(
    { isRead: true, readAt: new Date() },
    { where: { userId, isRead: false } }
  );

  res.json({ success: true, message: "All notifications marked as read" });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const count = await UserNotification.count({
    where: { userId, isRead: false },
  });

  res.json({ success: true, data: { unreadCount: count } });
});

export const updatePreferences = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const preferences = req.body;

  res.json({ success: true, message: "Preferences updated" });
});
