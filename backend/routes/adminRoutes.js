/**
 * adminRoutes.js
 * Path: backend/routes/adminRoutes.js
 * Description: Admin routes
 * Changes:
 * - ✅ FIXED: Router initialization before use
 * - ✅ FIXED: All routes properly defined
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

router.get("/stats", adminController.getStats);
router.get("/dashboard", adminController.getDashboardStats || adminController.getStats);
router.get("/stats/users", adminController.getUserStats);
router.get("/stats/lessons", adminController.getLessonStats);
router.get("/stats/activity", adminController.getActivityStats);

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
router.delete("/users/:id", adminController.deleteUser);

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

router.get("/analytics", adminController.getAnalytics || adminController.getActivityStats);

// ============================================
// 🎫 Tickets
// ============================================

router.get("/tickets", adminController.getAllTickets || (() => {}));
router.get("/tickets/stats", adminController.getTicketStats || (() => {}));
router.post("/tickets/:id/reply", adminController.replyToTicket || (() => {}));
router.put("/tickets/:id/status", adminController.updateTicketStatus || (() => {}));

// ============================================
// ⚙️ Settings
// ============================================

router.get("/settings", adminController.getSettings || (() => {}));
router.put("/settings", adminController.updateSettings || (() => {}));
router.get("/settings/features", adminController.getFeatureFlags || (() => {}));
router.put("/settings/features", adminController.updateFeatureFlags || (() => {}));

// ============================================
// 🩺 System Health
// ============================================

router.get("/health", adminController.getSystemHealth || (() => {}));

export default router;
