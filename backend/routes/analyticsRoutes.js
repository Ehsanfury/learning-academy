/**
 * analyticsRoutes.js
 * Path: backend/routes/analyticsRoutes.js
 * Description: Analytics routes
 */

import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  trackEvent,
  getUserStats,
  getWeeklyActivity,
  getLearningInsights,
} from "../controllers/analyticsController.js";

const router = express.Router();

router.use(authenticate);

router.post("/event", trackEvent);
router.get("/stats", getUserStats);
router.get("/weekly-activity", getWeeklyActivity);
router.get("/insights", getLearningInsights);

export default router;
