/**
 * adminRoutes.js
 * Path: backend/routes/adminRoutes.js
 * Description: Admin routes - Complete
 * Changes:
 * - ✅ FIXED: Added /top-users route
 * - ✅ FIXED: Added /users/growth route
 * - ✅ FIXED: Added /activity route
 * - ✅ FIXED: Added /exercises route
 */

import express from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";
import * as adminController from "../controllers/adminController.js";

const router = express.Router();

// ============================================
// 🔐 All admin routes require authentication + admin role
// ============================================

router.use(authenticate);
router.use(authorize("admin"));

// ============================================
// 📊 Dashboard & Statistics
// ============================================

router.get("/dashboard", adminController.getDashboardStats);
router.get("/stats", adminController.getStats);
router.get("/stats/users", adminController.getUserStats);
router.get("/stats/lessons", adminController.getLessonStats);
router.get("/stats/activity", adminController.getActivityStats);

// ✅ FIXED: Added /activity route
router.get("/activity", adminController.getActivityStats);

// ============================================
// 📊 Additional Admin Analytics
// ============================================

router.get("/top-users", adminController.getTopUsers);
router.get("/users/growth", adminController.getUserGrowth);

// ============================================
// 📚 Lesson Management
// ============================================

router.get("/lessons", adminController.getLessons);
router.get("/lessons/:id", adminController.getLessonById);
router.post("/lessons", adminController.createLesson);
router.put("/lessons/:id", adminController.updateLesson);
router.delete("/lessons/:id", adminController.deleteLesson);
router.post("/lessons/:id/status", adminController.updateLessonStatus);

// ============================================
// 🏋️ Exercise Management
// ============================================

router.get("/exercises", adminController.getExercises);
router.get("/exercises/:id", adminController.getExerciseById);
router.post("/exercises", adminController.createExercise);
router.put("/exercises/:id", adminController.updateExercise);
router.delete("/exercises/:id", adminController.deleteExercise);

// ============================================
// 👤 User Management
// ============================================

router.get("/users", adminController.getUsers);
router.get("/users/:id", adminController.getUserById);
router.put("/users/:id", adminController.updateUser);
router.put("/users/:id/role", adminController.updateUserRole);
router.put("/users/:id/status", adminController.updateUserStatus);
router.delete("/users/:id", adminController.deleteUser);

// ============================================
// 👨‍🏫 Mentor Management
// ============================================

router.get("/mentors", adminController.getMentors);
router.put("/mentors/:id/verify", adminController.verifyMentor);

// ============================================
// 🔔 Notifications (Broadcast)
// ============================================

router.get("/notifications", adminController.getNotifications);
router.post("/notifications", adminController.createNotification);
router.delete("/notifications/:id", adminController.deleteNotification);

// ============================================
// 📋 System Logs
// ============================================

router.get("/logs", adminController.getLogs);

// ============================================
// 🏆 Achievement Management
// ============================================

router.get("/achievements", adminController.getAchievements);
router.get("/achievements/:id", adminController.getAchievementById);
router.post("/achievements", adminController.createAchievement);
router.put("/achievements/:id", adminController.updateAchievement);
router.delete("/achievements/:id", adminController.deleteAchievement);

// ============================================
// 📈 Analytics
// ============================================

router.get("/analytics", adminController.getAnalytics);

// ============================================
// 🎫 Tickets
// ============================================

router.get("/tickets", adminController.getAllTickets);
router.get("/tickets/stats", adminController.getTicketStats);
router.get("/tickets/:id", adminController.getTicketById);
router.post("/tickets/:id/reply", adminController.replyToTicket);
router.put("/tickets/:id/status", adminController.updateTicketStatus);

// ============================================
// ⚙️ Settings
// ============================================

router.get("/settings", adminController.getSettings);
router.put("/settings", adminController.updateSettings);
router.get("/settings/features", adminController.getFeatureFlags);
router.put("/settings/features", adminController.updateFeatureFlags);

// ============================================
// 🩺 System Health
// ============================================

router.get("/health", adminController.getSystemHealth);

export default router;
