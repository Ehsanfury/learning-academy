/**
 * adminController.js
 * Path: backend/controllers/adminController.js
 * Description: Admin controller - Complete CRUD operations
 * Version: 1.0 - Complete
 */

import adminService from "../services/adminService.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { ValidationError, NotFoundError } from "../errors/index.js";
import logger from "../config/logger.js";

// ============================================
// 📊 Statistics
// ============================================

export const getStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getStats();
  res.json({ success: true, data: stats });
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
    data: result.lessons,
    pagination: {
      total: result.total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    },
  });
});

export const getLessonById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const lesson = await adminService.getLessonById(id);
  if (!lesson) {
    throw new NotFoundError(`Lesson with id "${id}" not found`);
  }
  res.json({ success: true, data: lesson });
});

export const createLesson = asyncHandler(async (req, res) => {
  const lesson = await adminService.createLesson(req.body);
  res.status(201).json({ success: true, data: lesson });
});

export const updateLesson = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const lesson = await adminService.updateLesson(id, req.body);
  if (!lesson) {
    throw new NotFoundError(`Lesson with id "${id}" not found`);
  }
  res.json({ success: true, data: lesson });
});

export const deleteLesson = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await adminService.deleteLesson(id);
  if (!result) {
    throw new NotFoundError(`Lesson with id "${id}" not found`);
  }
  res.json({ success: true, message: "Lesson deleted successfully" });
});

export const updateLessonStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!["draft", "published", "archived"].includes(status)) {
    throw new ValidationError("Invalid status. Must be draft, published, or archived");
  }
  const lesson = await adminService.updateLessonStatus(id, status);
  if (!lesson) {
    throw new NotFoundError(`Lesson with id "${id}" not found`);
  }
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
    data: result.exercises,
    pagination: {
      total: result.total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    },
  });
});

export const getExerciseById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const exercise = await adminService.getExerciseById(id);
  if (!exercise) {
    throw new NotFoundError(`Exercise with id "${id}" not found`);
  }
  res.json({ success: true, data: exercise });
});

export const createExercise = asyncHandler(async (req, res) => {
  const exercise = await adminService.createExercise(req.body);
  res.status(201).json({ success: true, data: exercise });
});

export const updateExercise = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const exercise = await adminService.updateExercise(id, req.body);
  if (!exercise) {
    throw new NotFoundError(`Exercise with id "${id}" not found`);
  }
  res.json({ success: true, data: exercise });
});

export const deleteExercise = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await adminService.deleteExercise(id);
  if (!result) {
    throw new NotFoundError(`Exercise with id "${id}" not found`);
  }
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
    data: result.users,
    pagination: {
      total: result.total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    },
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await adminService.getUserById(id);
  if (!user) {
    throw new NotFoundError(`User with id "${id}" not found`);
  }
  res.json({ success: true, data: user });
});

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await adminService.updateUser(id, req.body);
  if (!user) {
    throw new NotFoundError(`User with id "${id}" not found`);
  }
  res.json({ success: true, data: user });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!["user", "admin"].includes(role)) {
    throw new ValidationError("Invalid role. Must be user or admin");
  }
  const user = await adminService.updateUserRole(id, role);
  if (!user) {
    throw new NotFoundError(`User with id "${id}" not found`);
  }
  res.json({ success: true, data: user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await adminService.deleteUser(id);
  if (!result) {
    throw new NotFoundError(`User with id "${id}" not found`);
  }
  res.json({ success: true, message: "User deleted successfully" });
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
    data: result.achievements,
    pagination: {
      total: result.total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    },
  });
});

export const getAchievementById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const achievement = await adminService.getAchievementById(id);
  if (!achievement) {
    throw new NotFoundError(`Achievement with id "${id}" not found`);
  }
  res.json({ success: true, data: achievement });
});

export const createAchievement = asyncHandler(async (req, res) => {
  const achievement = await adminService.createAchievement(req.body);
  res.status(201).json({ success: true, data: achievement });
});

export const updateAchievement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const achievement = await adminService.updateAchievement(id, req.body);
  if (!achievement) {
    throw new NotFoundError(`Achievement with id "${id}" not found`);
  }
  res.json({ success: true, data: achievement });
});

export const deleteAchievement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await adminService.deleteAchievement(id);
  if (!result) {
    throw new NotFoundError(`Achievement with id "${id}" not found`);
  }
  res.json({ success: true, message: "Achievement deleted successfully" });
});
