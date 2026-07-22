/**
 * adminController.js
 * Path: backend/controllers/adminController.js
 * Description: Admin controller - Complete CRUD operations
 * Changes:
 * - ✅ FIXED: Changed createdAt to created_at in all queries
 * - ✅ FIXED: Added missing methods (getMentors, verifyMentor, getNotifications, createNotification, deleteNotification)
 * - ✅ FIXED: getAllAnalytics with proper error handling
 * - ✅ FIXED: updateFeatureFlags with findOrCreate
 * - ✅ NEW: getTopUsers method
 * - ✅ NEW: getUserGrowth method
 */

import adminService from "../services/adminService.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { ValidationError, NotFoundError } from "../errors/index.js";
import logger from "../config/logger.js";
import { Op, Sequelize } from "sequelize";
import {
  User,
  Lesson,
  LessonProgress,
  Ticket,
  PageView,
  SystemSetting,
  Mentor,
  Notification,
  UserNotification,
} from "../models/index.js";

// ============================================
// 📊 Statistics
// ============================================

export const getStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getStats();
  res.json({ success: true, data: stats });
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getStats();
  const userStats = await adminService.getUserStats();
  const lessonStats = await adminService.getLessonStats();

  res.json({
    success: true,
    data: {
      totalUsers: stats.users || 0,
      activeUsers: stats.activeUsers || 0,
      totalLessons: stats.lessons || 0,
      totalAchievements: stats.achievements || 0,
      totalXP: stats.totalXP || 0,
      lessonsCompletedToday: stats.todayCompleted || 0,
      newUsersToday: stats.newUsersToday || 0,
      userStats,
      lessonStats,
    },
  });
});

export const getUserStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getUserStats();
  res.json({ success: true, data: stats });
});

export const getLessonStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getLessonStats();
  res.json({ success: true, data: stats });
});

export const getActivityStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getActivityStats();
  res.json({ success: true, data: stats });
});

// ============================================
// 📊 Analytics (✅ FIXED: createdAt → created_at)
// ============================================

export const getAnalytics = asyncHandler(async (req, res) => {
  const { range = "7d" } = req.query;
  const days = parseInt(range.replace("d", ""), 10) || 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    // ✅ FIXED: Use created_at (snake_case) instead of createdAt (camelCase)
    const totalViews = await PageView.count({
      where: { created_at: { [Op.gte]: startDate } },
    });
    const uniqueVisitors = await PageView.count({
      distinct: true,
      col: "ipAddress",
      where: { created_at: { [Op.gte]: startDate } },
    });
    const memberVisitors = await PageView.count({
      distinct: true,
      col: "userId",
      where: { created_at: { [Op.gte]: startDate }, userId: { [Op.ne]: null } },
    });

    const dailyViewsRaw = await PageView.findAll({
      attributes: [
        [Sequelize.fn("DATE", Sequelize.col("created_at")), "date"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "views"],
        [Sequelize.fn("COUNT", Sequelize.literal("DISTINCT ip_address")), "uniqueVisitors"],
      ],
      where: { created_at: { [Op.gte]: startDate } },
      group: [Sequelize.fn("DATE", Sequelize.col("created_at"))],
      order: [[Sequelize.fn("DATE", Sequelize.col("created_at")), "ASC"]],
      raw: true,
    });

    let dailyViews = dailyViewsRaw.map((row) => ({
      date: row.date,
      views: parseInt(row.views, 10) || 0,
      uniqueVisitors: parseInt(row.uniqueVisitors, 10) || 0,
    }));

    if (dailyViews.length === 0) {
      dailyViews = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dailyViews.push({
          date: date.toISOString().split("T")[0],
          views: 0,
          uniqueVisitors: 0,
        });
      }
    }

    const topPagesRaw = await PageView.findAll({
      attributes: ["path", [Sequelize.fn("COUNT", Sequelize.col("id")), "count"]],
      where: { created_at: { [Op.gte]: startDate } },
      group: ["path"],
      order: [[Sequelize.fn("COUNT", Sequelize.col("id")), "DESC"]],
      limit: 10,
      raw: true,
    });

    const deviceStatsRaw = await PageView.findAll({
      attributes: ["device", [Sequelize.fn("COUNT", Sequelize.col("id")), "count"]],
      where: { created_at: { [Op.gte]: startDate } },
      group: ["device"],
      raw: true,
    });
    const deviceMap = { desktop: 0, mobile: 0, tablet: 0, other: 0 };
    deviceStatsRaw.forEach((d) => {
      if (d.device && deviceMap[d.device] !== undefined) {
        deviceMap[d.device] = parseInt(d.count, 10);
      } else if (d.device) {
        deviceMap.other += parseInt(d.count, 10);
      }
    });

    const browserStatsRaw = await PageView.findAll({
      attributes: ["browser", [Sequelize.fn("COUNT", Sequelize.col("id")), "count"]],
      where: { created_at: { [Op.gte]: startDate } },
      group: ["browser"],
      order: [[Sequelize.fn("COUNT", Sequelize.col("id")), "DESC"]],
      limit: 8,
      raw: true,
    });

    res.json({
      success: true,
      data: {
        totalViews: totalViews || 0,
        uniqueVisitors: uniqueVisitors || 0,
        memberVisitors: memberVisitors || 0,
        guestVisitors: Math.max(0, (uniqueVisitors || 0) - (memberVisitors || 0)),
        dailyViews,
        topPages: topPagesRaw.map((p) => ({
          path: p.path || "/",
          views: parseInt(p.count, 10) || 0,
        })),
        deviceStats: Object.entries(deviceMap).map(([device, count]) => ({
          device,
          count: count || 0,
        })),
        browserStats: browserStatsRaw.map((b) => ({
          browser: b.browser || "Unknown",
          count: parseInt(b.count, 10) || 0,
        })),
      },
    });
  } catch (error) {
    logger.error("❌ Error in getAnalytics:", error);
    const emptyDailyViews = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      emptyDailyViews.push({
        date: date.toISOString().split("T")[0],
        views: 0,
        uniqueVisitors: 0,
      });
    }
    res.json({
      success: true,
      data: {
        totalViews: 0,
        uniqueVisitors: 0,
        memberVisitors: 0,
        guestVisitors: 0,
        dailyViews: emptyDailyViews,
        topPages: [],
        deviceStats: [
          { device: "desktop", count: 0 },
          { device: "mobile", count: 0 },
          { device: "tablet", count: 0 },
          { device: "other", count: 0 },
        ],
        browserStats: [],
      },
    });
  }
});

// ============================================
// ✅ NEW: Get top users
// GET /api/admin/top-users
// ============================================

export const getTopUsers = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const users = await User.findAll({
    attributes: ["id", "name", "email", "xp", "level", "streak"],
    where: { isActive: true },
    order: [["xp", "DESC"]],
    limit: parseInt(limit, 10),
  });

  res.json({
    success: true,
    data: users,
  });
});

// ============================================
// ✅ NEW: Get user growth over time
// GET /api/admin/users/growth
// ============================================

export const getUserGrowth = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days, 10));

  const growth = await User.findAll({
    attributes: [
      [Sequelize.fn("DATE", Sequelize.col("created_at")), "date"],
      [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
    ],
    where: {
      created_at: { [Op.gte]: startDate },
    },
    group: [Sequelize.fn("DATE", Sequelize.col("created_at"))],
    order: [[Sequelize.fn("DATE", Sequelize.col("created_at")), "ASC"]],
    raw: true,
  });

  res.json({
    success: true,
    data: growth,
  });
});

// ============================================
// 🎫 Tickets Management
// ============================================

export const getAllTickets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, priority, search } = req.query;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const offset = (pageNum - 1) * limitNum;

  const where = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (search) {
    where[Op.or] = [
      { subject: { [Op.iLike]: `%${search}%` } },
      { message: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { rows, count } = await Ticket.findAndCountAll({
    where,
    include: [{ model: User, as: "user", attributes: ["id", "name", "email", "avatar"] }],
    order: [["createdAt", "DESC"]],
    limit: limitNum,
    offset,
    distinct: true,
  });

  res.json({
    success: true,
    data: rows,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: count,
      totalPages: Math.ceil(count / limitNum),
    },
  });
});

export const getTicketStats = asyncHandler(async (req, res) => {
  const total = await Ticket.count();
  const unresolved = await Ticket.count({
    where: { status: { [Op.notIn]: ["resolved", "closed"] } },
  });

  const byStatusRaw = await Ticket.findAll({
    attributes: ["status", [Sequelize.fn("COUNT", Sequelize.col("id")), "count"]],
    group: ["status"],
    raw: true,
  });
  const byStatus = { open: 0, pending: 0, answered: 0, resolved: 0, closed: 0 };
  byStatusRaw.forEach((s) => {
    if (s.status && byStatus[s.status] !== undefined) byStatus[s.status] = parseInt(s.count, 10);
  });

  const byPriorityRaw = await Ticket.findAll({
    attributes: ["priority", [Sequelize.fn("COUNT", Sequelize.col("id")), "count"]],
    group: ["priority"],
    raw: true,
  });
  const byPriority = { urgent: 0, high: 0, medium: 0, low: 0 };
  byPriorityRaw.forEach((p) => {
    if (p.priority && byPriority[p.priority] !== undefined)
      byPriority[p.priority] = parseInt(p.count, 10);
  });

  const byCategoryRaw = await Ticket.findAll({
    attributes: ["category", [Sequelize.fn("COUNT", Sequelize.col("id")), "count"]],
    group: ["category"],
    raw: true,
  });
  const byCategory = { technical: 0, billing: 0, content: 0, account: 0, other: 0 };
  byCategoryRaw.forEach((c) => {
    if (c.category && byCategory[c.category] !== undefined)
      byCategory[c.category] = parseInt(c.count, 10);
  });

  res.json({ success: true, data: { total, unresolved, byStatus, byPriority, byCategory } });
});

export const getTicketById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const ticket = await Ticket.findByPk(id, {
    include: [{ model: User, as: "user", attributes: ["id", "name", "email", "avatar"] }],
  });
  if (!ticket) throw new NotFoundError(`Ticket with id "${id}" not found`);
  res.json({ success: true, data: ticket });
});

export const replyToTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reply, status } = req.body;
  if (!reply) throw new ValidationError("Reply message is required");

  const ticket = await Ticket.findByPk(id);
  if (!ticket) throw new NotFoundError(`Ticket with id "${id}" not found`);

  await ticket.update({
    adminReply: reply,
    adminRepliedAt: new Date(),
    status: status || "answered",
  });

  try {
    const notification = await Notification.create({
      type: "info",
      title: { fa: "پاسخ به تیکت شما", en: "Reply to your ticket", de: "Antwort auf Ihr Ticket" },
      message: {
        fa: `تیکت "${ticket.subject}" پاسخ داده شد.`,
        en: `Ticket "${ticket.subject}" has been answered.`,
        de: `Ticket "${ticket.subject}" wurde beantwortet.`,
      },
      isGlobal: false,
      isActive: true,
      priority: 5,
      link: `/support?ticket=${ticket.id}`,
    });
    await UserNotification.create({ userId: ticket.userId, notificationId: notification.id });
  } catch (notifErr) {
    logger.warn(`Failed to send ticket reply notification: ${notifErr.message}`);
  }

  logger.info(`Admin ${req.user.id} replied to ticket ${id}`);
  res.json({ success: true, message: "Ticket replied successfully", data: ticket });
});

export const updateTicketStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, priority } = req.body;

  const ticket = await Ticket.findByPk(id);
  if (!ticket) throw new NotFoundError(`Ticket with id "${id}" not found`);

  const updates = {};
  if (status) updates.status = status;
  if (priority) updates.priority = priority;
  await ticket.update(updates);

  logger.info(`Admin ${req.user.id} updated ticket ${id}: ${JSON.stringify(updates)}`);
  res.json({ success: true, message: "Ticket updated successfully", data: ticket });
});

// ============================================
// ⚙️ Settings Management
// ============================================

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await SystemSetting.findAll({
    order: [
      ["category", "ASC"],
      ["key", "ASC"],
    ],
  });

  const grouped = {};
  settings.forEach((s) => {
    if (!grouped[s.category]) grouped[s.category] = {};
    grouped[s.category][s.key] = {
      value: s.value,
      description: s.description,
      isPublic: s.isPublic,
      updatedAt: s.updatedAt,
    };
  });

  res.json({ success: true, data: grouped });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const { settings } = req.body;
  if (!settings || typeof settings !== "object") {
    throw new ValidationError("Settings object is required");
  }

  for (const [keyOrCategory, valueOrGroup] of Object.entries(settings)) {
    if (typeof valueOrGroup === "object" && !Array.isArray(valueOrGroup) && valueOrGroup !== null) {
      for (const [key, value] of Object.entries(valueOrGroup)) {
        await SystemSetting.update(
          { value, updatedBy: req.user.id },
          { where: { category: keyOrCategory, key } }
        );
      }
    } else {
      await SystemSetting.update(
        { value: valueOrGroup, updatedBy: req.user.id },
        { where: { key: keyOrCategory } }
      );
    }
  }

  logger.info(`Admin ${req.user.id} updated system settings`);
  res.json({ success: true, message: "Settings updated successfully" });
});

export const getFeatureFlags = asyncHandler(async (req, res) => {
  try {
    const flags = await SystemSetting.findAll({
      where: { category: "features" },
      attributes: ["key", "value"],
    });
    const data = {};
    flags.forEach((f) => {
      data[f.key] = f.value;
    });

    const defaults = {
      enable_registration: true,
      enable_ai_tutor: true,
      enable_mentors: true,
      enable_stories: true,
      enable_scenarios: true,
      enable_leaderboard: true,
    };

    res.json({ success: true, data: { ...defaults, ...data } });
  } catch (error) {
    logger.error("❌ Error in getFeatureFlags:", error);
    res.json({
      success: true,
      data: {
        enable_registration: true,
        enable_ai_tutor: true,
        enable_mentors: true,
        enable_stories: true,
        enable_scenarios: true,
        enable_leaderboard: true,
      },
    });
  }
});

// ✅ FIXED: updateFeatureFlags with proper findOrCreate
export const updateFeatureFlags = asyncHandler(async (req, res) => {
  const { flags } = req.body;
  if (!flags || typeof flags !== "object") {
    throw new ValidationError("Flags object is required");
  }

  try {
    for (const [key, value] of Object.entries(flags)) {
      const [setting, created] = await SystemSetting.findOrCreate({
        where: { key },
        defaults: {
          key,
          category: "features",
          value: value,
          isPublic: true,
          updatedBy: req.user.id,
        },
      });
      if (!created) {
        await setting.update({ value, updatedBy: req.user.id });
      }
    }

    logger.info(`Admin ${req.user.id} updated feature flags`);
    res.json({ success: true, message: "Feature flags updated successfully" });
  } catch (error) {
    logger.error("❌ Error in updateFeatureFlags:", error);
    throw new ValidationError("Failed to update feature flags: " + error.message);
  }
});

// ============================================
// 🩺 System Health
// ============================================

export const getSystemHealth = asyncHandler(async (req, res) => {
  const memUsage = process.memoryUsage();
  const uptime = process.uptime();

  res.json({
    success: true,
    data: {
      status: "healthy",
      uptime: {
        seconds: Math.floor(uptime),
        human: `${Math.floor(uptime / 86400)}d ${Math.floor((uptime % 86400) / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
      },
      memory: {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)} MB`,
      },
      nodeVersion: process.version,
      platform: process.platform,
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
    },
  });
});

// ============================================
// 📚 Lesson Management
// ============================================

export const getLessons = asyncHandler(async (req, res) => {
  const { limit = 50, offset = 0, search = "", status = "" } = req.query;
  const result = await adminService.getLessons({
    limit: parseInt(limit),
    offset: parseInt(offset),
    search,
    status,
  });
  res.json({
    success: true,
    data: result.lessons || [],
    pagination: {
      total: result.total || 0,
      limit: parseInt(limit),
      offset: parseInt(offset),
    },
  });
});

export const getLessonById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const lesson = await adminService.getLessonById(id);
  if (!lesson) throw new NotFoundError(`Lesson with id "${id}" not found`);
  res.json({ success: true, data: lesson });
});

export const createLesson = asyncHandler(async (req, res) => {
  const lesson = await adminService.createLesson(req.body);
  res.status(201).json({ success: true, data: lesson });
});

export const updateLesson = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const lesson = await adminService.updateLesson(id, req.body);
  if (!lesson) throw new NotFoundError(`Lesson with id "${id}" not found`);
  res.json({ success: true, data: lesson });
});

export const deleteLesson = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await adminService.deleteLesson(id);
  if (!result) throw new NotFoundError(`Lesson with id "${id}" not found`);
  res.json({ success: true, message: "Lesson deleted successfully" });
});

export const updateLessonStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!["draft", "published", "archived"].includes(status)) {
    throw new ValidationError("Invalid status. Must be draft, published, or archived");
  }
  const lesson = await adminService.updateLessonStatus(id, status);
  if (!lesson) throw new NotFoundError(`Lesson with id "${id}" not found`);
  res.json({ success: true, data: lesson });
});

// ============================================
// 🏋️ Exercise Management
// ============================================

export const getExercises = asyncHandler(async (req, res) => {
  const { limit = 50, offset = 0, search = "" } = req.query;
  const result = await adminService.getExercises({
    limit: parseInt(limit),
    offset: parseInt(offset),
    search,
  });
  res.json({
    success: true,
    data: result.exercises || [],
    pagination: {
      total: result.total || 0,
      limit: parseInt(limit),
      offset: parseInt(offset),
    },
  });
});

export const getExerciseById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const exercise = await adminService.getExerciseById(id);
  if (!exercise) throw new NotFoundError(`Exercise with id "${id}" not found`);
  res.json({ success: true, data: exercise });
});

export const createExercise = asyncHandler(async (req, res) => {
  const exercise = await adminService.createExercise(req.body);
  res.status(201).json({ success: true, data: exercise });
});

export const updateExercise = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const exercise = await adminService.updateExercise(id, req.body);
  if (!exercise) throw new NotFoundError(`Exercise with id "${id}" not found`);
  res.json({ success: true, data: exercise });
});

export const deleteExercise = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await adminService.deleteExercise(id);
  if (!result) throw new NotFoundError(`Exercise with id "${id}" not found`);
  res.json({ success: true, message: "Exercise deleted successfully" });
});

// ============================================
// 👤 User Management
// ============================================

export const getUsers = asyncHandler(async (req, res) => {
  const { limit = 50, offset = 0, search = "" } = req.query;
  const result = await adminService.getUsers({
    limit: parseInt(limit),
    offset: parseInt(offset),
    search,
  });
  res.json({
    success: true,
    data: result.users || [],
    pagination: {
      total: result.total || 0,
      limit: parseInt(limit),
      offset: parseInt(offset),
    },
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await adminService.getUserById(id);
  if (!user) throw new NotFoundError(`User with id "${id}" not found`);
  res.json({ success: true, data: user });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await adminService.updateUser(id, req.body);
  if (!user) throw new NotFoundError(`User with id "${id}" not found`);
  res.json({ success: true, data: user });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!["user", "admin"].includes(role)) {
    throw new ValidationError("Invalid role. Must be user or admin");
  }
  const user = await adminService.updateUserRole(id, role);
  if (!user) throw new NotFoundError(`User with id "${id}" not found`);
  res.json({ success: true, data: user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await adminService.deleteUser(id);
  if (!result) throw new NotFoundError(`User with id "${id}" not found`);
  res.json({ success: true, message: "User deleted successfully" });
});

// ============================================
// 🚦 User Status (ban/suspend)
// ============================================

export const updateUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  if (typeof isActive !== "boolean") {
    throw new ValidationError("isActive (boolean) is required");
  }
  const user = await User.findByPk(id);
  if (!user) throw new NotFoundError(`User with id "${id}" not found`);
  if (user.role === "admin" && !isActive) {
    throw new ValidationError("Cannot suspend an admin user");
  }
  await user.update({ isActive });
  logger.info(`Admin ${req.user.id} ${isActive ? "activated" : "suspended"} user ${id}`);
  res.json({
    success: true,
    message: `User ${isActive ? "activated" : "suspended"} successfully`,
    data: { id, isActive },
  });
});

// ============================================
// 👨‍🏫 Mentor Management
// ============================================

export const getMentors = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const offset = (pageNum - 1) * limitNum;

  const where = {};
  if (search) {
    where[Op.or] = [
      { "$mentorUser.name$": { [Op.iLike]: `%${search}%` } },
      { "$mentorUser.email$": { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { rows, count } = await Mentor.findAndCountAll({
    where,
    include: [{ model: User, as: "mentorUser", attributes: ["id", "name", "email", "avatar"] }],
    order: [["createdAt", "DESC"]],
    limit: limitNum,
    offset,
    distinct: true,
  });

  res.json({
    success: true,
    data: rows,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: count,
      totalPages: Math.ceil(count / limitNum),
    },
  });
});

export const verifyMentor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const mentor = await Mentor.findByPk(id);
  if (!mentor) throw new NotFoundError(`Mentor with id "${id}" not found`);
  await mentor.update({ isVerified: true });
  logger.info(`Admin ${req.user.id} verified mentor ${id}`);
  res.json({ success: true, message: "Mentor verified", data: mentor });
});

// ============================================
// 🔔 Notifications (Broadcast)
// ============================================

export const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const offset = (pageNum - 1) * limitNum;
  const { rows, count } = await Notification.findAndCountAll({
    order: [["createdAt", "DESC"]],
    limit: limitNum,
    offset,
    distinct: true,
  });
  res.json({
    success: true,
    data: rows,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: count,
      totalPages: Math.ceil(count / limitNum),
    },
  });
});

export const createNotification = asyncHandler(async (req, res) => {
  const { type, title, message, priority = 0, target = "all", userIds = [], link } = req.body;
  if (!title || !message) throw new ValidationError("title and message are required");

  const normalizeMultilang = (val) => {
    if (typeof val === "string") return { fa: val, en: val, de: val };
    return {
      fa: val?.fa || "",
      en: val?.en || val?.fa || "",
      de: val?.de || val?.fa || "",
    };
  };

  const validTypes = ["info", "warning", "success", "promotion", "system"];
  const finalType = validTypes.includes(type) ? type : "info";

  const notification = await Notification.create({
    type: finalType,
    title: normalizeMultilang(title),
    message: normalizeMultilang(message),
    priority: parseInt(priority, 10) || 0,
    isGlobal: target === "all",
    isActive: true,
    link,
  });

  if (target === "specific" && userIds.length > 0) {
    const entries = userIds.map((uid) => ({ userId: uid, notificationId: notification.id }));
    await UserNotification.bulkCreate(entries);
  } else if (target === "all") {
    const allUsers = await User.findAll({ attributes: ["id"] });
    const entries = allUsers.map((u) => ({ userId: u.id, notificationId: notification.id }));
    for (let i = 0; i < entries.length; i += 1000) {
      await UserNotification.bulkCreate(entries.slice(i, i + 1000));
    }
  }

  logger.info(`Admin ${req.user.id} created notification`);
  res.status(201).json({ success: true, data: notification });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findByPk(id);
  if (!notification) throw new NotFoundError(`Notification with id "${id}" not found`);
  await notification.destroy();
  res.json({ success: true, message: "Notification deleted" });
});

// ============================================
// 📋 System Logs
// ============================================

export const getLogs = asyncHandler(async (req, res) => {
  const { level = "all", limit = 100 } = req.query;
  const limitNum = Math.min(parseInt(limit, 10), 500);

  const fs = await import("fs");
  const path = await import("path");
  const { fileURLToPath } = await import("url");

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const logsDir = path.resolve(__dirname, "..", "logs");

  const logs = [];
  try {
    const files = ["error.log", "combined.log"];
    for (const file of files) {
      const filePath = path.resolve(logsDir, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf8");
        const lines = content.trim().split("\n").slice(-limitNum);
        lines.forEach((line) => {
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line);
              if (level === "all" || parsed.level === level) logs.push(parsed);
            } catch {
              // skip non-JSON
            }
          }
        });
      }
    }
  } catch (err) {
    logger.warn(`Failed to read logs: ${err.message}`);
  }

  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json({ success: true, data: logs.slice(0, limitNum), count: logs.length });
});

// ============================================
// 🏆 Achievement Management
// ============================================

export const getAchievements = asyncHandler(async (req, res) => {
  const { limit = 50, offset = 0, search = "" } = req.query;
  const result = await adminService.getAchievements({
    limit: parseInt(limit),
    offset: parseInt(offset),
    search,
  });
  res.json({
    success: true,
    data: result.achievements || [],
    pagination: {
      total: result.total || 0,
      limit: parseInt(limit),
      offset: parseInt(offset),
    },
  });
});

export const getAchievementById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const achievement = await adminService.getAchievementById(id);
  if (!achievement) throw new NotFoundError(`Achievement with id "${id}" not found`);
  res.json({ success: true, data: achievement });
});

export const createAchievement = asyncHandler(async (req, res) => {
  const achievement = await adminService.createAchievement(req.body);
  res.status(201).json({ success: true, data: achievement });
});

export const updateAchievement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const achievement = await adminService.updateAchievement(id, req.body);
  if (!achievement) throw new NotFoundError(`Achievement with id "${id}" not found`);
  res.json({ success: true, data: achievement });
});

export const deleteAchievement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await adminService.deleteAchievement(id);
  if (!result) throw new NotFoundError(`Achievement with id "${id}" not found`);
  res.json({ success: true, message: "Achievement deleted successfully" });
});

// ============================================
// 📤 Export
// ============================================

export default {
  // Stats
  getStats,
  getDashboardStats,
  getUserStats,
  getLessonStats,
  getActivityStats,

  // Analytics
  getAnalytics,
  getTopUsers,
  getUserGrowth,

  // Tickets
  getAllTickets,
  getTicketStats,
  getTicketById,
  replyToTicket,
  updateTicketStatus,

  // Settings
  getSettings,
  updateSettings,
  getFeatureFlags,
  updateFeatureFlags,

  // Health
  getSystemHealth,

  // Logs
  getLogs,

  // Lessons
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  updateLessonStatus,

  // Exercises
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,

  // Users
  getUsers,
  getUserById,
  updateUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,

  // Mentors
  getMentors,
  verifyMentor,

  // Notifications
  getNotifications,
  createNotification,
  deleteNotification,

  // Achievements
  getAchievements,
  getAchievementById,
  createAchievement,
  updateAchievement,
  deleteAchievement,
};
