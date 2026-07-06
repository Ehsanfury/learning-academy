/**
 * scenariosRoutes.js
 * Path: backend/routes/scenariosRoutes.js
 * Description: Scenario routes
 */

import express from "express";
import {
  getScenarios,
  getScenarioById,
  startScenario,
  submitStep,
  getScenarioProgress,
  getScenarioStats,
} from "../controllers/scenariosController.js"; // ✅ اصلاح: scenariosController.js (با s)
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

// همه مسیرها نیاز به احراز هویت دارند
router.use(authenticate);

router.get("/", getScenarios);
router.get("/stats", getScenarioStats);
router.get("/:id", getScenarioById);
router.post("/:id/start", startScenario);
router.post("/:id/step", submitStep);
router.get("/:id/progress", getScenarioProgress);

export default router;
