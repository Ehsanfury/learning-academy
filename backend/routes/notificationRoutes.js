/**
 * notificationRoutes.js
 * Path: backend/routes/notificationRoutes.js
 * Description: Notification routes
 */

import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  updatePreferences,
} from "../controllers/notificationController.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getNotifications);
router.put("/:id/read", markAsRead);
router.put("/read-all", markAllAsRead);
router.get("/unread-count", getUnreadCount);
router.put("/preferences", updatePreferences);

export default router;
