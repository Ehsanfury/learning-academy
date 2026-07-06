/**
 * levelsRoutes.js
 * Path: backend/routes/levelsRoutes.js
 * Description: Levels routes
 */

import express from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { getLevels, getLevel, getLevelProgress } from "../controllers/levelsController.js";

const router = express.Router();

// TODO: Translate - TODO: Translate - مسیرهای عمومی (نیاز به احراز هویت)
router.use(authenticate);

// TODO: Translate - TODO: Translate - دریافت همه سطوح
router.get("/", getLevels);

// TODO: Translate - TODO: Translate - دریافت یک سطح خاص
router.get("/:levelId", getLevel);

// TODO: Translate - TODO: Translate - دریافت پیشرفت یک سطح
router.get("/:levelId/progress", getLevelProgress);

export default router;
